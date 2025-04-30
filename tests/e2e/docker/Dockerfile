FROM mcr.microsoft.com/playwright:v1.52.0-noble

# Set working directory
WORKDIR /app

# Copy test code
COPY . /app

RUN npm install
RUN npm run compile:proto
RUN echo 'PUBLIC_API_BASE_URL=http://localhost:8080' > .env

# Install dependencies
CMD node scripts/run-playwright.js test
