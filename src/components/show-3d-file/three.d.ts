declare global {
  declare module 'react' {
    namespace JSX {
      interface IntrinsicElements {
        color: any
        primitive: any
      }
    }
  }
}
