'use client'

import { useState } from 'react'

export default function AaaFeature() {
  const [count, setCount] = useState(0)

  return (
    <div style={{
      border: '2px solid #ccc',
      borderRadius: '8px',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Feature AAA
      </h2>
      <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
        This is a simple interactive feature demonstrating the &quot;aaa&quot; functionality.
      </p>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          Counter: <strong>{count}</strong>
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => setCount(count + 1)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: '#4CAF50',
              color: 'white'
            }}
          >
            Increment
          </button>
          <button
            onClick={() => setCount(count - 1)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: '#f44336',
              color: 'white'
            }}
          >
            Decrement
          </button>
          <button
            onClick={() => setCount(0)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: '#2196F3',
              color: 'white'
            }}
          >
            Reset
          </button>
        </div>
      </div>
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '4px'
      }}>
        <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
          AAA: A simple demonstration feature with interactive counter functionality
        </p>
      </div>
    </div>
  )
}
