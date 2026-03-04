import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';
import { templateWelcome } from '@/lib/emailTemplates';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, username, role, firstName, lastName } = body;

    // Basic validation
    if (!email || !password || !firstName || !lastName || !username || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Normalize role to uppercase to match Prisma Enum (CLIENT or FREELANCER)
    const normalizedRole = role.toUpperCase();
    if (normalizedRole !== 'CLIENT' && normalizedRole !== 'FREELANCER') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if user exists (email or username)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email or username already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
        role: normalizedRole as any,
      },
    });

    // Send welcome email (fire-and-forget)
    const { subject, html } = templateWelcome({
      firstName: user.firstName,
      email: user.email,
      role: normalizedRole as 'CLIENT' | 'FREELANCER',
    });
    sendEmail({ to: user.email, subject, html }).catch((e) =>
      console.error('[Signup] Welcome email failed:', e)
    );

    return NextResponse.json({user: { id: user.id, email: user.email, username: user.username, firstName: user.firstName } }, { status: 201 });
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
