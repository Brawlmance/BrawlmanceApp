import type { Express } from 'express'
import legends from './legends'
import ranking from './ranking'
import weapons from './weapons'
import patches from './patches'
import randomFact from './random_fact'
import health from './health'

export function setupRoutes(app: Express): void {
  legends(app)
  ranking(app)
  weapons(app)
  patches(app)
  randomFact(app)
  health(app)
}
