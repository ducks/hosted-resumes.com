<svelte:head>
  <title>hosted-resumes.com - your resume, your subdomain</title>
  <meta
    name="description"
    content="Create a structured JOBL resume, choose a theme, and publish it on your personal subdomain."
  />
</svelte:head>

<section class="hero">
  <h1>Your resume, your subdomain.</h1>
  <p class="subheadline">
    Create a structured JOBL resume. Pick a theme. Publish it at
    <strong>yourname.hosted-resumes.com</strong>.
  </p>
  <div class="hero-actions">
    <a href="/register" class="btn btn-primary">Get started free</a>
    <a href="#how-it-works" class="link-secondary">See how it works</a>
  </div>
</section>

<section id="how-it-works" class="how-it-works">
  <h2>How it works</h2>
  <div class="steps">
    <div class="step">
      <span class="step-number">1</span>
      <h3>Write your resume</h3>
      <p>
        Use the structured JOBL editor to add your experience,
        skills, and projects in a clean, portable format.
      </p>
    </div>
    <div class="step">
      <span class="step-number">2</span>
      <h3>Choose a theme</h3>
      <p>
        Pick from Classic, Modern, or Minimal. Each theme is
        designed to present your work clearly.
      </p>
    </div>
    <div class="step">
      <span class="step-number">3</span>
      <h3>Publish on your subdomain</h3>
      <p>
        Your resume goes live at
        <strong>yourname.hosted-resumes.com</strong> - share it
        anywhere.
      </p>
    </div>
  </div>
</section>

<section class="features">
  <h2>Features</h2>
  <div class="feature-grid">
    <div class="feature-card">
      <h3>Live preview</h3>
      <p>See changes as you type in the editor.</p>
    </div>
    <div class="feature-card">
      <h3>Multiple themes</h3>
      <p>Classic, Modern, and Minimal to match your style.</p>
    </div>
    <div class="feature-card">
      <h3>PDF export</h3>
      <p>Download a formatted PDF of your resume.</p>
    </div>
    <div class="feature-card">
      <h3>Version history</h3>
      <p>Track every change and revert when needed.</p>
    </div>
    <div class="feature-card">
      <h3>Personal subdomain</h3>
      <p>yourname.hosted-resumes.com - memorable and professional.</p>
    </div>
    <div class="feature-card">
      <h3>Structured format</h3>
      <p>Powered by JOBL - a portable, human-readable resume spec.</p>
    </div>
  </div>
</section>

<section class="pricing-preview">
  <h2>Simple pricing</h2>
  <div class="tiers">
    <div class="tier">
      <h3>Free</h3>
      <p class="price">$0/mo</p>
      <p>1 resume with basic themes and subdomain hosting.</p>
    </div>
    <div class="tier">
      <h3>Pro</h3>
      <p class="price">$5/mo</p>
      <p>Unlimited resumes, all themes, PDF export.</p>
    </div>
    <div class="tier">
      <h3>Business</h3>
      <p class="price">$15/mo</p>
      <p>Everything in Pro plus custom domains and analytics.</p>
    </div>
  </div>
  <a href="/pricing" class="link-secondary">See full pricing</a>
</section>

<section class="bottom-cta">
  <h2>Ready to build your resume?</h2>
  <a href="/register" class="btn btn-primary">Sign up free</a>
</section>

<style>
  section {
    padding: 3rem 0;
  }

  h1 {
    font-size: 2.5rem;
    line-height: 1.2;
    margin: 0 0 1rem;
  }

  h2 {
    font-size: 1.75rem;
    margin: 0 0 2rem;
  }

  h3 {
    font-size: 1.125rem;
    margin: 0 0 0.5rem;
  }

  p {
    margin: 0;
    line-height: 1.6;
  }

  .hero {
    padding: 4rem 0;
    text-align: center;
  }

  .subheadline {
    font-size: 1.125rem;
    color: var(--color-muted);
    max-width: 560px;
    margin: 0 auto 2rem;
  }

  .hero-actions {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    align-items: center;
  }

  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
  }

  .btn-primary {
    background: var(--color-primary);
    color: #fff;
  }

  .btn-primary:hover {
    opacity: 0.9;
  }

  .link-secondary {
    color: var(--color-muted);
    text-decoration: none;
    font-size: 0.9375rem;
  }

  .link-secondary:hover {
    color: var(--color-text);
  }

  .how-it-works {
    text-align: center;
    border-top: 1px solid var(--color-border);
  }

  .steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  .step {
    text-align: center;
  }

  .step-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: var(--color-primary);
    color: #fff;
    font-weight: 700;
    font-size: 1.125rem;
    margin-bottom: 1rem;
  }

  .step p {
    color: var(--color-muted);
    font-size: 0.9375rem;
  }

  .features {
    text-align: center;
    border-top: 1px solid var(--color-border);
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    text-align: left;
  }

  .feature-card {
    padding: 1.5rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
  }

  .feature-card p {
    color: var(--color-muted);
    font-size: 0.9375rem;
  }

  .pricing-preview {
    text-align: center;
    border-top: 1px solid var(--color-border);
  }

  .tiers {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .tier {
    padding: 1.5rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    text-align: center;
  }

  .price {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-primary);
    margin: 0.5rem 0 0.75rem;
  }

  .tier p:last-child {
    color: var(--color-muted);
    font-size: 0.9375rem;
  }

  .bottom-cta {
    text-align: center;
    padding: 4rem 0;
    border-top: 1px solid var(--color-border);
  }

  .bottom-cta h2 {
    margin-bottom: 1.5rem;
  }

  @media (max-width: 640px) {
    h1 {
      font-size: 1.75rem;
    }

    .hero-actions {
      flex-direction: column;
      gap: 1rem;
    }

    .steps {
      grid-template-columns: 1fr;
    }

    .feature-grid {
      grid-template-columns: 1fr;
    }

    .tiers {
      grid-template-columns: 1fr;
    }
  }
</style>
