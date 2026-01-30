import AaaFeature from '@/components/AaaFeature'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>
          School Presentation
        </h1>
        <AaaFeature />
      </div>
    </main>
  )
}
