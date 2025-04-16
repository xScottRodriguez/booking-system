-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('pendiente', 'confirmada', 'cancelada', 'expirada');

-- CreateTable
CREATE TABLE "booking" (
    "id" SERIAL NOT NULL,
    "date" VARCHAR(10) NOT NULL,
    "hour" VARCHAR(8) NOT NULL,
    "client_id" INTEGER,
    "status_id" INTEGER,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(200),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(12) NOT NULL,

    CONSTRAINT "status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_google_account" BOOLEAN NOT NULL DEFAULT false,
    "activation_token" VARCHAR,
    "reset_password_token" VARCHAR,
    "role_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "units_required" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation" (
    "id" SERIAL NOT NULL,
    "client_name" TEXT,
    "client_phone" TEXT,
    "service_type_id" INTEGER NOT NULL,
    "reservation_date" TIMESTAMP(3) NOT NULL,
    "scheduled_time" TIMESTAMP(3),
    "status" "ReservationStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_schedule_config" (
    "id" SERIAL NOT NULL,
    "default_total_units" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_schedule_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_schedule_configuration" (
    "id" SERIAL NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "total_units" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_schedule_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_setting" (
    "id" SERIAL NOT NULL,
    "unit_duration_minutes" INTEGER NOT NULL DEFAULT 20,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_role_name" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_status_name" ON "status"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_email" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "unique_activation_token" ON "users"("activation_token");

-- CreateIndex
CREATE UNIQUE INDEX "unique_reset_password_token" ON "users"("reset_password_token");

-- CreateIndex
CREATE UNIQUE INDEX "daily_schedule_configuration_scheduled_date_key" ON "daily_schedule_configuration"("scheduled_date");

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "fk_booking_client" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "fk_booking_status" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "fk_users_roles" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
