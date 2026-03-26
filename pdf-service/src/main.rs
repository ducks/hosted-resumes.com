use axum::{
  Router,
  body::Bytes,
  extract::DefaultBodyLimit,
  http::{HeaderMap, HeaderValue, StatusCode, header},
  response::{IntoResponse, Json, Response},
  routing::{get, post},
};
use headless_chrome::{Browser, LaunchOptions};
use serde::Serialize;
use std::net::SocketAddr;
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use tracing::{error, info};

#[derive(Serialize)]
struct HealthResponse {
  status: &'static str,
}

#[derive(Serialize)]
struct ErrorResponse {
  error: String,
  detail: String,
}

enum AppError {
  BadRequest(String),
  InternalError(String),
}

impl IntoResponse for AppError {
  fn into_response(self) -> Response {
    let (status, error, detail) = match self {
      AppError::BadRequest(msg) => {
        (StatusCode::BAD_REQUEST, "bad request", msg)
      }
      AppError::InternalError(ref msg) => {
        error!("render failed: {msg}");
        (StatusCode::INTERNAL_SERVER_ERROR, "pdf rendering failed", msg.clone())
      }
    };

    let body = Json(ErrorResponse {
      error: error.to_string(),
      detail,
    });

    (status, body).into_response()
  }
}

async fn health_check() -> Json<HealthResponse> {
  Json(HealthResponse { status: "ok" })
}

async fn render_pdf(body: Bytes) -> Result<Response, AppError> {
  if body.is_empty() {
    return Err(AppError::BadRequest("empty body".to_string()));
  }

  let html = String::from_utf8(body.to_vec())
    .map_err(|e| AppError::BadRequest(format!("invalid utf-8: {e}")))?;

  let pdf_bytes = tokio::task::spawn_blocking(move || {
    generate_pdf(&html)
  })
  .await
  .map_err(|e| AppError::InternalError(format!("task join error: {e}")))?
  .map_err(|e| AppError::InternalError(format!("{e}")))?;

  let mut headers = HeaderMap::new();
  headers.insert(
    header::CONTENT_TYPE,
    HeaderValue::from_static("application/pdf"),
  );
  headers.insert(
    header::CONTENT_DISPOSITION,
    HeaderValue::from_static("inline"),
  );

  Ok((StatusCode::OK, headers, pdf_bytes).into_response())
}

fn generate_pdf(html: &str) -> Result<Vec<u8>, String> {
  let launch_options = LaunchOptions::default_builder()
    .sandbox(false)
    .build()
    .map_err(|e| format!("failed to build launch options: {e}"))?;

  let browser = Browser::new(launch_options)
    .map_err(|e| format!("failed to launch browser: {e}"))?;

  let tab = browser
    .new_tab()
    .map_err(|e| format!("failed to create tab: {e}"))?;

  tab
    .navigate_to(&format!(
      "data:text/html;base64,{}",
      base64_encode(html.as_bytes())
    ))
    .map_err(|e| format!("failed to navigate: {e}"))?;

  tab
    .wait_until_navigated()
    .map_err(|e| format!("navigation timeout: {e}"))?;

  let pdf_bytes = tab
    .print_to_pdf(Some(headless_chrome::types::PrintToPdfOptions {
      landscape: Some(false),
      display_header_footer: Some(false),
      print_background: Some(true),
      paper_width: Some(8.5),
      paper_height: Some(11.0),
      margin_top: Some(0.0),
      margin_bottom: Some(0.0),
      margin_left: Some(0.0),
      margin_right: Some(0.0),
      ..Default::default()
    }))
    .map_err(|e| format!("pdf generation failed: {e}"))?;

  Ok(pdf_bytes)
}

fn base64_encode(data: &[u8]) -> String {
  const CHARS: &[u8] =
    b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  let mut result = String::with_capacity((data.len() + 2) / 3 * 4);
  for chunk in data.chunks(3) {
    let b0 = chunk[0] as u32;
    let b1 = chunk.get(1).copied().unwrap_or(0) as u32;
    let b2 = chunk.get(2).copied().unwrap_or(0) as u32;
    let triple = (b0 << 16) | (b1 << 8) | b2;

    result.push(CHARS[(triple >> 18 & 0x3F) as usize] as char);
    result.push(CHARS[(triple >> 12 & 0x3F) as usize] as char);

    if chunk.len() > 1 {
      result.push(CHARS[(triple >> 6 & 0x3F) as usize] as char);
    } else {
      result.push('=');
    }

    if chunk.len() > 2 {
      result.push(CHARS[(triple & 0x3F) as usize] as char);
    } else {
      result.push('=');
    }
  }
  result
}

#[tokio::main]
async fn main() {
  tracing_subscriber::fmt()
    .with_env_filter(
      tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| {
          "pdf_service=info,tower_http=info".parse().unwrap()
        }),
    )
    .init();

  let host = std::env::var("PDF_SERVICE_HOST")
    .unwrap_or_else(|_| "0.0.0.0:3001".to_string());

  let app = Router::new()
    .route("/health", get(health_check))
    .route("/render", post(render_pdf))
    .layer(DefaultBodyLimit::max(2 * 1024 * 1024))
    .layer(TraceLayer::new_for_http())
    .layer(CorsLayer::permissive());

  let addr: SocketAddr = host.parse().expect("invalid PDF_SERVICE_HOST");
  let listener = tokio::net::TcpListener::bind(addr)
    .await
    .expect("failed to bind");

  info!("pdf-service listening on {addr}");

  axum::serve(listener, app)
    .await
    .expect("server error");
}

#[cfg(test)]
mod tests {
  use super::*;
  use axum::body::Body;
  use axum::http::Request;
  use tower::ServiceExt;

  fn app() -> Router {
    Router::new()
      .route("/health", get(health_check))
      .route("/render", post(render_pdf))
      .layer(DefaultBodyLimit::max(2 * 1024 * 1024))
  }

  #[tokio::test]
  async fn test_health_check() {
    let response = app()
      .oneshot(
        Request::builder()
          .uri("/health")
          .body(Body::empty())
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
      .await
      .unwrap();
    let json: serde_json::Value =
      serde_json::from_slice(&body).unwrap();
    assert_eq!(json["status"], "ok");
  }

  #[tokio::test]
  async fn test_render_empty_body() {
    let response = app()
      .oneshot(
        Request::builder()
          .method("POST")
          .uri("/render")
          .header("content-type", "text/html")
          .body(Body::empty())
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
  }

  #[tokio::test]
  #[ignore] // requires chromium installed
  async fn test_render_valid_html() {
    let html = "<html><body><h1>Test</h1></body></html>";
    let response = app()
      .oneshot(
        Request::builder()
          .method("POST")
          .uri("/render")
          .header("content-type", "text/html")
          .body(Body::from(html))
          .unwrap(),
      )
      .await
      .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(
      response.headers().get("content-type").unwrap(),
      "application/pdf"
    );

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
      .await
      .unwrap();
    assert!(body.starts_with(b"%PDF-"));
  }
}
