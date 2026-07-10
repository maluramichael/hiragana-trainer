import '@testing-library/jest-dom'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// localStorage is backed by jsdom, but reset it between tests so state never leaks.
beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
})
