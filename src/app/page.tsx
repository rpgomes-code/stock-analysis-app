// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to dashboard page
  redirect('/dashboard');
}