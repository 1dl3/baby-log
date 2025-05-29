import { boolean, integer, pgTable, text, timestamp, uuid, varchar, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const user = pgTable('user', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: text('email').notNull().unique(),
	password: text('password').notNull(),
	name: text('name').notNull(),
	emailVerified: boolean('email_verified').notNull().default(false),
	verificationToken: text('verification_token'),
	resetToken: text('reset_token'),
	resetTokenExpires: timestamp('reset_token_expires')
});

export const sessions = pgTable('sessions', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	token: text('token').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	expiresAt: timestamp('expires_at').notNull()
});

export const baby = pgTable('baby', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
		// Note: userId should default to the logged-in user's ID when creating a new baby
		// This is handled in the API endpoint that creates babies
	name: text('name').notNull(),
	birthDate: timestamp('birth_date').notNull(),
	gender: text('gender').notNull(),
	photoUrl: text('photo_url'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	shareCode: text('share_code').unique(),
	shareCodeExpires: timestamp('share_code_expires')
});

export const sharedBaby = pgTable('shared_baby', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	canEdit: boolean('can_edit').notNull().default(false)
});

export const diaperChange = pgTable('diaper_change', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	type: text('type').notNull(), // wet, dirty, both
	notes: text('notes'),
	timestamp: timestamp('timestamp').notNull().defaultNow()
});

export const feeding = pgTable('feeding', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	type: text('type').notNull(), // bottle, nursing, solid
	amount: integer('amount'), // in ml for bottle, null for nursing
	notes: text('notes'),
	timestamp: timestamp('timestamp').notNull().defaultNow()
});

export const nursing = pgTable('nursing', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	duration: integer('duration').notNull(), // in minutes
	side: text('side').notNull(), // left, right, both
	notes: text('notes'),
	timestamp: timestamp('timestamp').notNull().defaultNow()
});

export const qrCode = pgTable('qr_code', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	type: varchar('type', { length: 50 }).notNull(), // diaper, feeding, nursing, photo, size, weight
	code: varchar('code', { length: 255 }).notNull().unique(),
	link: text('link').notNull().unique(),
	createdAt: timestamp('created_at').defaultNow()
});

export const photo = pgTable('photo', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	photoUrl: text('photo_url').notNull(),
	notes: text('notes'),
	timestamp: timestamp('timestamp').notNull().defaultNow()
});

export const size = pgTable('size', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	height: numeric('height').notNull(), // in cm
	notes: text('notes'),
	timestamp: timestamp('timestamp').notNull().defaultNow()
});

export const weight = pgTable('weight', {
	id: uuid('id').primaryKey().defaultRandom(),
	babyId: uuid('baby_id')
		.notNull()
		.references(() => baby.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	weight: numeric('weight').notNull(), // in kg
	notes: text('notes'),
	timestamp: timestamp('timestamp').notNull().defaultNow()
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
	babies: many(baby),
	sharedBabies: many(sharedBaby),
	diaperChanges: many(diaperChange),
	feedings: many(feeding),
	nursingSessions: many(nursing),
	photos: many(photo),
	sizes: many(size),
	weights: many(weight),
	qrCodes: many(qrCode)
}));

export const babyRelations = relations(baby, ({ one, many }) => ({
	owner: one(user, {
		fields: [baby.userId],
		references: [user.id]
	}),
	sharedWith: many(sharedBaby),
	diaperChanges: many(diaperChange),
	feedings: many(feeding),
	nursingSessions: many(nursing),
	photos: many(photo),
	sizes: many(size),
	weights: many(weight),
	qrCodes: many(qrCode)
}));

export const sharedBabyRelations = relations(sharedBaby, ({ one }) => ({
	baby: one(baby, {
		fields: [sharedBaby.babyId],
		references: [baby.id]
	}),
	user: one(user, {
		fields: [sharedBaby.userId],
		references: [user.id]
	})
}));
