-- Convert qr_code.user_id and qr_code.baby_id to UUID type
ALTER TABLE "qr_code" ALTER COLUMN "user_id" TYPE uuid USING "user_id"::uuid;
ALTER TABLE "qr_code" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "qr_code" ALTER COLUMN "baby_id" TYPE uuid USING "baby_id"::uuid;
ALTER TABLE "qr_code" ALTER COLUMN "baby_id" SET NOT NULL;
ALTER TABLE "qr_code" ADD CONSTRAINT "qr_code_baby_id_baby_id_fk" FOREIGN KEY ("baby_id") REFERENCES "public"."baby"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "qr_code" ADD CONSTRAINT "qr_code_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;