import { lazy, Suspense } from 'react';
import { Toaster } from '@workspace/nova-havens-design-system/components/ui/toaster';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import Layout from '@/components/Layout';
import { useRouteMeta } from '@/lib/useRouteMeta';

// Keep route-specific UI and its dependencies out of the initial download.
// Vite emits a separate chunk for each module, which React loads on navigation.
const HomePage = lazy(() => import('@/pages/HomePage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('@/pages/TermsOfServicePage'));
const LlmsTxtPage = lazy(() => import('@/pages/LlmsTxtPage'));
const TeamPage = lazy(() => import('@/pages/TeamPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const NotFound = lazy(() => import('@/pages/not-found'));

function Router() {
  useRouteMeta();
  return (
    <Layout>
      <Suspense
        fallback={<div aria-busy="true" aria-label="Loading page" role="status" />}
      >
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/blog" component={BlogPage} />
          <Route path="/blog/:slug" component={BlogPostPage} />
          <Route path="/meet-the-team" component={TeamPage} />
          <Route path="/about-us" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/privacy-policy" component={PrivacyPolicyPage} />
          <Route path="/terms-of-service" component={TermsOfServicePage} />
          <Route path="/llms-txt" component={LlmsTxtPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Router />
      <Toaster />
    </WouterRouter>
  );
}

export default App;
