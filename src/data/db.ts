import { PrismaClient } from '@prisma/client'
import { fetchLeague } from '@src/queries/offical/league'

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var db: PrismaClient | undefined
}

export const db =
  global.db ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') global.db = db

export const seedDb = async ()=>{
  const leagues = await fetchLeague()
  leagues.forEach(it=>{
    db.league.upsert({
      create:it,
      update:it,
      where: it
    })
  })
}