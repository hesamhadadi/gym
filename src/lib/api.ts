import { NextResponse } from 'next/server';
import { DatabaseConnectionError } from '@/lib/db';

export function handleApiError(error: unknown) {
  console.error(error);

  if (error instanceof DatabaseConnectionError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  return NextResponse.json({ error: 'Server error' }, { status: 500 });
}
