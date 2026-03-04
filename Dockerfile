FROM node:20

WORKDIR /app

RUN apt-get update \
  && apt-get install -y git \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies with npm (package-lock is present)
# Copy prisma early so postinstall `prisma generate` has the schema available
COPY package.json package-lock.json prisma ./
RUN npm ci

# Copy the rest of the app
COPY . .

# Provide safe defaults so build-time SSR code that touches these envs does not fail.
ENV STRIPE_SECRET_KEY=dummy \
    SENDGRID_API_KEY=dummy \
    SENDGRID_FROM_EMAIL=dummy@example.com

# Build artifacts without requiring a live database
RUN npx prisma generate
RUN npx next build

ENV NODE_ENV=production
EXPOSE 3000

# Run migrations against the runtime DATABASE_URL, then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
