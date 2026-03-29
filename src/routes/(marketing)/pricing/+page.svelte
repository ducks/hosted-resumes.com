<svelte:head>
  <title>Pricing - hosted-resumes.com</title>
  <meta
    name="description"
    content="Free, Pro, and Business plans for hosting your resume on hosted-resumes.com."
  />
</svelte:head>

<section class="pricing-header">
  <h1>Pricing</h1>
  <p>Start free. Upgrade when you need more.</p>
</section>

<section class="pricing-cards">
  <div class="card">
    <h2>Free</h2>
    <p class="price">$0<span>/mo</span></p>
    <ul>
      <li>1 resume</li>
      <li>Basic themes (Classic)</li>
      <li>Subdomain hosting</li>
      <li>JOBL editor</li>
    </ul>
    <a href="/register" class="btn">Get started free</a>
  </div>

  <div class="card popular">
    <span class="badge">Most popular</span>
    <h2>Pro</h2>
    <p class="price">$5<span>/mo</span></p>
    <ul>
      <li>Unlimited resumes</li>
      <li>All themes (Classic, Modern, Minimal)</li>
      <li>PDF export</li>
      <li>Version history</li>
      <li>Priority support</li>
    </ul>
    <a href="/register?plan=pro" class="btn btn-primary">
      Start with Pro
    </a>
  </div>

  <div class="card">
    <h2>Business</h2>
    <p class="price">$15<span>/mo</span></p>
    <ul>
      <li>Everything in Pro</li>
      <li>Custom domain support</li>
      <li>Analytics</li>
      <li>White-label options</li>
    </ul>
    <a href="/register?plan=business" class="btn">
      Start with Business
    </a>
  </div>
</section>

<section class="faq">
  <h2>Frequently asked questions</h2>

  <div class="faq-list">
    <div class="faq-item">
      <h3>What is JOBL?</h3>
      <p>
        JOBL is a structured, human-readable resume format. It keeps
        your data portable and separate from presentation. Learn more
        in the
        <a href="https://jobl.dev">JOBL spec</a>.
      </p>
    </div>

    <div class="faq-item">
      <h3>Can I use a custom domain?</h3>
      <p>
        Yes. Custom domain support is available on the Business plan.
        Point your domain to our servers and we handle the rest.
      </p>
    </div>

    <div class="faq-item">
      <h3>How does PDF export work?</h3>
      <p>
        PDFs are rendered server-side from your themed resume. Click
        export and download a print-ready file.
      </p>
    </div>

    <div class="faq-item">
      <h3>Can I cancel anytime?</h3>
      <p>
        Yes. There are no contracts. Cancel your subscription at any
        time from your account settings.
      </p>
    </div>

    <div class="faq-item">
      <h3>What happens if I downgrade?</h3>
      <p>
        Your data stays intact. You keep access to features included
        in your new plan but lose premium features like PDF export
        and additional themes.
      </p>
    </div>
  </div>
</section>

<section class="bottom-cta">
  <h2>Start building your resume today</h2>
  <a href="/register" class="btn btn-primary">Sign up free</a>
</section>

<style>
  section {
    padding: 3rem 0;
  }

  .pricing-header {
    text-align: center;
    padding-bottom: 1rem;
  }

  .pricing-header h1 {
    font-size: 2.5rem;
    margin: 0 0 0.75rem;
  }

  .pricing-header p {
    color: var(--color-muted);
    font-size: 1.125rem;
    margin: 0;
  }

  .pricing-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    align-items: start;
  }

  .card {
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .card.popular {
    border-color: var(--color-primary);
    border-width: 2px;
  }

  .badge {
    position: absolute;
    top: -0.75rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-primary);
    color: #fff;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    white-space: nowrap;
  }

  .card h2 {
    font-size: 1.25rem;
    margin: 0 0 0.5rem;
  }

  .price {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 1.5rem;
    line-height: 1;
  }

  .price span {
    font-size: 1rem;
    font-weight: 400;
    color: var(--color-muted);
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem;
    flex: 1;
  }

  li {
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-border);
    font-size: 0.9375rem;
    color: var(--color-muted);
  }

  li:last-child {
    border-bottom: none;
  }

  .btn {
    display: block;
    text-align: center;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    border: 1px solid var(--color-border);
    color: var(--color-text);
  }

  .btn:hover {
    border-color: var(--color-muted);
  }

  .btn-primary {
    background: var(--color-primary);
    color: #fff;
    border-color: var(--color-primary);
  }

  .btn-primary:hover {
    opacity: 0.9;
    border-color: var(--color-primary);
  }

  .faq {
    border-top: 1px solid var(--color-border);
  }

  .faq h2 {
    font-size: 1.75rem;
    margin: 0 0 2rem;
  }

  .faq-list {
    max-width: 640px;
  }

  .faq-item {
    margin-bottom: 2rem;
  }

  .faq-item h3 {
    font-size: 1rem;
    margin: 0 0 0.5rem;
  }

  .faq-item p {
    color: var(--color-muted);
    font-size: 0.9375rem;
    margin: 0;
    line-height: 1.6;
  }

  .faq-item a {
    color: var(--color-primary);
  }

  .bottom-cta {
    text-align: center;
    padding: 4rem 0;
    border-top: 1px solid var(--color-border);
  }

  .bottom-cta h2 {
    font-size: 1.75rem;
    margin: 0 0 1.5rem;
  }

  @media (max-width: 640px) {
    .pricing-header h1 {
      font-size: 1.75rem;
    }

    .pricing-cards {
      grid-template-columns: 1fr;
    }
  }
</style>
