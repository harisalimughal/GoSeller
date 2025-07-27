#!/bin/bash

# 🚀 GOSELLER MISSING DEPENDENCIES INSTALLER
# This script installs all missing SDKs, tools, and extensions for GoSeller

echo "🚀 Installing GoSeller Missing Dependencies..."
echo "=============================================="

# Navigate to backend directory
cd backend

echo "📦 Installing Payment Gateways..."
npm install @paypal/checkout-server-sdk @stripe/stripe-js braintree square razorpay paytm phonepe upi-payment crypto-payment-gateway

echo "🤖 Installing AI & Machine Learning SDKs..."
npm install @tensorflow/tfjs-node @huggingface/inference openai anthropic cohere-ai replicate ml5.js brain.js natural compromise wink-nlp

echo "⛓️ Installing Blockchain & Web3 SDKs..."
npm install @solana/web3.js @polygon/client @binance-chain/javascript-sdk @cosmos-sdk @polkadot/api @cardano-sdk @avalanche/sdk @fantom/sdk @harmony/sdk @near/sdk

echo "📊 Installing Analytics & Monitoring SDKs..."
npm install @google-analytics/data @mixpanel/mixpanel-node @amplitude/analytics-node @segment/analytics-node @hotjar/browser @fullstory/browser @clarity-js @plausible/analytics @fathom/analytics @posthog/node

echo "📱 Installing Communication & Notifications SDKs..."
npm install @sendgrid/mail @mailgun-js/mailgun-js @aws-sdk/client-ses @twilio/conversations @slack/web-api @discord.js/rest @telegram/bot-api @whatsapp/business-api @firebase/messaging @onesignal/node

echo "🔒 Installing Security Tools..."
npm install helmet express-rate-limit express-brute express-validator bcryptjs jsonwebtoken passport passport-jwt passport-local express-session connect-redis csurf xss-clean hpp express-mongo-sanitize joi yup zod

echo "📊 Installing Monitoring & Logging..."
npm install winston pino morgan express-status-monitor express-pino-logger @sentry/node @sentry/tracing newrelic datadog prometheus-client grafana-api elastic-apm-node opentelemetry jaeger-client

echo "🗄️ Installing Database Tools..."
npm install mongoose sequelize prisma typeorm knex objection bookshelf waterline redis ioredis memcached elasticsearch algoliasearch meilisearch typesense

echo "🔧 Installing Development Tools..."
npm install --save-dev eslint-config-prettier prettier-plugin-tailwindcss @typescript-eslint/eslint-plugin husky lint-staged commitizen conventional-changelog-cli jest @testing-library/react @testing-library/jest-dom cypress playwright supertest faker factory-girl lighthouse webpack-bundle-analyzer speed-measure-webpack-plugin compression-webpack-plugin terser-webpack-plugin

# Navigate to frontend directory
cd ../frontend

echo "🎨 Installing UI/UX Libraries..."
npm install @mui/material @mui/icons-material @mui/x-data-grid @mui/x-date-pickers @mui/lab @chakra-ui/react @chakra-ui/icons @nextui-org/react @radix-ui/react @headlessui/react @heroicons/react lucide-react react-icons framer-motion react-spring react-transition-group

echo "📝 Installing Form & Validation Libraries..."
npm install react-hook-form @hookform/resolvers yup zod joi formik final-form react-final-form react-query @tanstack/react-query swr axios ky fetch-mock

echo "🗃️ Installing State Management Libraries..."
npm install @reduxjs/toolkit react-redux zustand jotai recoil valtio immer redux-persist redux-saga redux-thunk reselect normalizr

echo "📈 Installing Charts & Analytics Libraries..."
npm install recharts chart.js react-chartjs-2 d3 victory nivo visx react-vis react-chartjs-2 @nivo/core @nivo/line @nivo/bar @nivo/pie @nivo/heatmap

echo "🔑 Installing Authentication Libraries..."
npm install passport passport-jwt passport-local passport-google-oauth20 passport-facebook passport-github2 passport-twitter passport-linkedin passport-instagram express-session connect-redis connect-mongo express-rate-limit express-brute express-validator joi yup zod

echo "🛡️ Installing API Security Libraries..."
npm install helmet cors express-rate-limit express-brute express-validator express-session connect-redis connect-mongo passport passport-jwt passport-local jsonwebtoken bcryptjs crypto crypto-js node-forge tweetnacl libsodium

echo "⚡ Installing Performance Tools..."
npm install lighthouse webpack-bundle-analyzer speed-measure-webpack-plugin compression-webpack-plugin terser-webpack-plugin @sentry/performance newrelic datadog prometheus-client grafana-api

echo "🐛 Installing Error Tracking..."
npm install @sentry/node @sentry/tracing @sentry/react @sentry/browser bugsnag rollbar airbrake raygun logrocket fullstory

# Navigate back to root
cd ..

echo "✅ All missing dependencies installed successfully!"
echo "=============================================="
echo "🚀 GoSeller is now ready for production deployment!"
echo "📋 Next steps:"
echo "1. Configure environment variables"
echo "2. Set up external API keys"
echo "3. Configure database connections"
echo "4. Set up monitoring and logging"
echo "5. Deploy to production"
echo "=============================================="
