import type { Express, Response } from "express";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { isAuthenticated } from "./supabaseAuth";

type Row = Record<string, any>;

async function query(statement: ReturnType<typeof sql>): Promise<Row[]> {
  const result: any = await db.execute(statement);
  return result.rows ?? result;
}

function displayName(row: Row, prefix = ''): string {
  const first = row[`${prefix}first_name`];
  const last = row[`${prefix}last_name`];
  const email: string = row[`${prefix}email`] || '';
  const name = [first, last].filter(Boolean).join(' ').trim();
  return name || email.split('@')[0] || 'Bytewise member';
}

const inviteSchema = z.object({ email: z.string().trim().toLowerCase().email() });

const shareSchema = z.object({
  type: z.enum(['meal', 'fast', 'water']),
  title: z.string().trim().min(1).max(200),
  details: z.record(z.union([z.string(), z.number(), z.null()])).optional(),
  note: z.string().trim().max(280).optional(),
});

const summarySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dayStart: z.string().datetime(),
  dayEnd: z.string().datetime(),
  note: z.string().trim().max(280).optional(),
});

export function registerFriendsRoutes(app: Express) {
  app.get('/api/friends', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    try {
      const rows = await query(sql`
        select fc.id, fc.status, fc.requester_id, fc.created_at,
               u.id as other_id, u.email, u.first_name, u.last_name
        from friend_connections fc
        join users u on u.id = case when fc.requester_id = ${userId} then fc.addressee_id else fc.requester_id end
        where fc.requester_id = ${userId} or fc.addressee_id = ${userId}
        order by fc.created_at desc
      `);

      const toPerson = (row: Row) => ({
        connectionId: row.id,
        userId: row.other_id,
        name: displayName(row),
        email: row.email,
        since: row.created_at,
      });

      res.json({
        friends: rows.filter(r => r.status === 'accepted').map(toPerson),
        incoming: rows.filter(r => r.status === 'pending' && r.requester_id !== userId).map(toPerson),
        outgoing: rows.filter(r => r.status === 'pending' && r.requester_id === userId).map(toPerson),
      });
    } catch (error: any) {
      console.error('❌ Failed to load friends:', error.message);
      res.status(500).json({ message: 'Failed to load friends' });
    }
  });

  app.post('/api/friends/invite', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    try {
      const [target] = await query(sql`select id from users where lower(email) = ${parsed.data.email} limit 1`);
      if (!target) {
        return res.status(404).json({ message: 'No Bytewise member uses that email. Ask them to create an account first.' });
      }
      if (target.id === userId) {
        return res.status(400).json({ message: "That's your own email." });
      }

      const [existing] = await query(sql`
        select id, status, requester_id from friend_connections
        where least(requester_id, addressee_id) = least(${userId}::uuid, ${target.id}::uuid)
          and greatest(requester_id, addressee_id) = greatest(${userId}::uuid, ${target.id}::uuid)
      `);

      if (existing?.status === 'accepted') {
        return res.status(409).json({ message: "You're already connected." });
      }
      if (existing && existing.requester_id === userId) {
        return res.status(409).json({ message: 'Invite already sent. Waiting for them to accept.' });
      }
      if (existing) {
        await query(sql`update friend_connections set status = 'accepted', responded_at = now() where id = ${existing.id}`);
        return res.json({ status: 'accepted', message: 'They had already invited you, so you are now connected.' });
      }

      await query(sql`insert into friend_connections (requester_id, addressee_id) values (${userId}, ${target.id})`);
      res.json({ status: 'pending', message: 'Invite sent. They will see it in Friends & Family.' });
    } catch (error: any) {
      console.error('❌ Failed to send invite:', error.message);
      res.status(500).json({ message: 'Failed to send invite' });
    }
  });

  app.post('/api/friends/:id/accept', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    try {
      const rows = await query(sql`
        update friend_connections set status = 'accepted', responded_at = now()
        where id = ${Number(req.params.id)} and addressee_id = ${userId} and status = 'pending'
        returning id
      `);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Invite not found' });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Failed to accept invite:', error.message);
      res.status(500).json({ message: 'Failed to accept invite' });
    }
  });

  // Declines an invite, cancels one you sent, or removes a connection.
  app.delete('/api/friends/:id', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    try {
      const rows = await query(sql`
        delete from friend_connections
        where id = ${Number(req.params.id)} and (requester_id = ${userId} or addressee_id = ${userId})
        returning id
      `);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Connection not found' });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Failed to remove connection:', error.message);
      res.status(500).json({ message: 'Failed to remove connection' });
    }
  });

  app.get('/api/activity-feed', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    try {
      const rows = await query(sql`
        select sa.id, sa.user_id, sa.activity_type, sa.title, sa.details, sa.note, sa.created_at,
               u.email, u.first_name, u.last_name
        from shared_activities sa
        join users u on u.id = sa.user_id
        where sa.user_id = ${userId}
           or sa.user_id in (
             select case when requester_id = ${userId} then addressee_id else requester_id end
             from friend_connections
             where status = 'accepted' and (requester_id = ${userId} or addressee_id = ${userId})
           )
        order by sa.created_at desc
        limit 50
      `);

      res.json({
        activities: rows.map(row => ({
          id: row.id,
          type: row.activity_type,
          title: row.title,
          details: row.details,
          note: row.note,
          createdAt: row.created_at,
          isMine: row.user_id === userId,
          author: displayName(row),
        })),
      });
    } catch (error: any) {
      console.error('❌ Failed to load activity feed:', error.message);
      res.status(500).json({ message: 'Failed to load activity feed' });
    }
  });

  app.post('/api/activities/share', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    const parsed = shareSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid activity' });
    }

    try {
      const { type, title, details, note } = parsed.data;
      const [row] = await query(sql`
        insert into shared_activities (user_id, activity_type, title, details, note)
        values (${userId}, ${type}, ${title}, ${details ? JSON.stringify(details) : null}::jsonb, ${note || null})
        returning id
      `);
      res.json({ id: row.id });
    } catch (error: any) {
      console.error('❌ Failed to share activity:', error.message);
      res.status(500).json({ message: 'Failed to share activity' });
    }
  });

  // Totals come from the server's own records so a shared summary can't be edited before posting.
  app.post('/api/activities/share-summary', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    const parsed = summarySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    try {
      const { date, dayStart, dayEnd, note } = parsed.data;
      const [mealTotals] = await query(sql`
        select count(*)::int as meals, coalesce(sum(total_calories), 0)::float as calories,
               coalesce(sum(total_protein), 0)::float as protein
        from meals where user_id = ${userId} and (date at time zone 'UTC')::date = ${date}::date
      `);
      const [water] = await query(sql`
        select coalesce(max(glasses), 0)::int as glasses
        from water_intake where user_id = ${userId} and (date at time zone 'UTC')::date = ${date}::date
      `);
      const [fast] = await query(sql`
        select plan_name, actual_duration from fasting_sessions
        where user_id = ${userId} and status = 'completed'
          and completed_at >= ${dayStart}::timestamptz and completed_at < ${dayEnd}::timestamptz
        order by completed_at desc limit 1
      `);

      const details = {
        meals: mealTotals?.meals ?? 0,
        calories: Math.round(mealTotals?.calories ?? 0),
        protein: Math.round(mealTotals?.protein ?? 0),
        water: water?.glasses ?? 0,
        fast: fast ? `${fast.plan_name}${fast.actual_duration ? ` · ${Math.round(fast.actual_duration / 3600000)}h` : ''}` : null,
      };

      const [row] = await query(sql`
        insert into shared_activities (user_id, activity_type, title, details, note)
        values (${userId}, 'summary', ${"Today's summary"}, ${JSON.stringify(details)}::jsonb, ${note || null})
        returning id
      `);
      res.json({ id: row.id, details });
    } catch (error: any) {
      console.error('❌ Failed to share summary:', error.message);
      res.status(500).json({ message: 'Failed to share summary' });
    }
  });

  app.delete('/api/activities/:id', isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user?.id;
    try {
      const rows = await query(sql`
        delete from shared_activities where id = ${Number(req.params.id)} and user_id = ${userId} returning id
      `);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Activity not found' });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Failed to delete activity:', error.message);
      res.status(500).json({ message: 'Failed to delete activity' });
    }
  });
}
