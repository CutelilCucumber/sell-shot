import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'

export default defineConfig({
  schema: 'prisma/schema.prisma',

  datasource: {
    url: env('DIRECT_URL'),
  },

  migrate: {
    async adapter() {
      return new PrismaPg({ connectionString: env('DIRECT_URL') })
    }
  }
})