import type { AppProps } from 'next/app'
import '@/styles/globals.css'
import 'highlight.js/styles/github-dark.css'
import { ProgressProvider } from '@/context/ProgressContext'
import Layout from '@/components/layout/Layout'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <ProgressProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ProgressProvider>
    </ErrorBoundary>
  )
}
