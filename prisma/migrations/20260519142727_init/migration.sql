-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN_REAL_ESTATE', 'AGENT');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_VALIDATION', 'ACTIVE', 'IN_REVIEW', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('CASA', 'DEPARTAMENTO', 'TERRENO', 'CAMPO', 'LOCAL', 'OFICINA', 'CABANA', 'GALPON');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('ACTIVE', 'PAUSED', 'IN_REVIEW', 'SOLD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'CONTACT_OPENED', 'REJECTED', 'LATENT', 'CLOSED', 'CONFLICT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MATCH', 'VALIDATION', 'MEMBERSHIP', 'STOCK_CLEANING', 'CONFLICT', 'FOLLOW_UP');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "auth_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "license_number" TEXT,
    "role" "Role" NOT NULL DEFAULT 'AGENT',
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VALIDATION',
    "real_estate_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "real_estates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "neighborhood" TEXT,
    "city" TEXT NOT NULL,
    "professional_license" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VALIDATION',
    "membership_expires_at" TIMESTAMP(3),
    "internal_notes" TEXT,
    "owner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "real_estates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "real_estate_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "cadastral_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'ACTIVE',
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "address" TEXT NOT NULL,
    "address_hash" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "neighborhood" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "description" TEXT,
    "documentation" TEXT,
    "financing" BOOLEAN NOT NULL DEFAULT false,
    "financing_percent" INTEGER,
    "accepts_trade" BOOLEAN NOT NULL DEFAULT false,
    "trade_percent" INTEGER,
    "services" JSONB NOT NULL DEFAULT '{}',
    "features" JSONB NOT NULL DEFAULT '{}',
    "field_features" JSONB NOT NULL DEFAULT '{}',
    "quality" JSONB NOT NULL DEFAULT '{}',
    "rejection_count_90" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_images" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "public_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "real_estate_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "min_budget" DECIMAL(12,2) NOT NULL,
    "max_budget" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "desired_types" "PropertyType"[],
    "desired_cities" TEXT[],
    "desired_neighborhoods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "financing_needed" BOOLEAN NOT NULL DEFAULT false,
    "financing_percent" INTEGER,
    "has_trade" BOOLEAN NOT NULL DEFAULT false,
    "trade_percent" INTEGER,
    "needs_credit" BOOLEAN NOT NULL DEFAULT false,
    "requirements" JSONB NOT NULL DEFAULT '{}',
    "field_requirements" JSONB NOT NULL DEFAULT '{}',
    "min_match_threshold" INTEGER NOT NULL DEFAULT 70,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "requester_id" TEXT,
    "score" INTEGER NOT NULL,
    "differences" JSONB NOT NULL DEFAULT '[]',
    "exclusions" JSONB NOT NULL DEFAULT '[]',
    "status" "MatchStatus" NOT NULL DEFAULT 'PROPOSED',
    "commission_accepted_at" TIMESTAMP(3),
    "contact_opened_at" TIMESTAMP(3),
    "follow_up_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "real_estate_id" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "real_estate_id" TEXT NOT NULL,
    "user_id" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'BASE',
    "active_until" TIMESTAMP(3) NOT NULL,
    "seats" INTEGER NOT NULL DEFAULT 5,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_user_id_key" ON "users"("auth_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_real_estate_id_idx" ON "users"("real_estate_id");

-- CreateIndex
CREATE INDEX "real_estates_status_idx" ON "real_estates"("status");

-- CreateIndex
CREATE INDEX "properties_real_estate_id_type_status_idx" ON "properties"("real_estate_id", "type", "status");

-- CreateIndex
CREATE INDEX "properties_price_idx" ON "properties"("price");

-- CreateIndex
CREATE UNIQUE INDEX "properties_address_hash_status_key" ON "properties"("address_hash", "status");

-- CreateIndex
CREATE UNIQUE INDEX "properties_real_estate_id_cadastral_id_key" ON "properties"("real_estate_id", "cadastral_id");

-- CreateIndex
CREATE INDEX "property_images_property_id_idx" ON "property_images"("property_id");

-- CreateIndex
CREATE INDEX "clients_real_estate_id_status_idx" ON "clients"("real_estate_id", "status");

-- CreateIndex
CREATE INDEX "clients_max_budget_idx" ON "clients"("max_budget");

-- CreateIndex
CREATE INDEX "matches_status_score_idx" ON "matches"("status", "score");

-- CreateIndex
CREATE UNIQUE INDEX "matches_client_id_property_id_key" ON "matches"("client_id", "property_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- CreateIndex
CREATE INDEX "notifications_real_estate_id_idx" ON "notifications"("real_estate_id");

-- CreateIndex
CREATE INDEX "memberships_real_estate_id_active_until_idx" ON "memberships"("real_estate_id", "active_until");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_real_estate_id_fkey" FOREIGN KEY ("real_estate_id") REFERENCES "real_estates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "real_estates" ADD CONSTRAINT "real_estates_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_real_estate_id_fkey" FOREIGN KEY ("real_estate_id") REFERENCES "real_estates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_real_estate_id_fkey" FOREIGN KEY ("real_estate_id") REFERENCES "real_estates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_real_estate_id_fkey" FOREIGN KEY ("real_estate_id") REFERENCES "real_estates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
