import {MigrationInterface, QueryRunner} from "typeorm";

export class AddForceMigration1637159113805 implements MigrationInterface {
    name = 'AddForceMigration1637159113805'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comments" ("id" SERIAL NOT NULL, "text" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer, "articleId" integer, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" SERIAL NOT NULL, "text" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "roomId" integer, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "joined-rooms" ("id" SERIAL NOT NULL, "socketId" character varying NOT NULL, "userId" integer, "roomId" integer, CONSTRAINT "PK_ea0d6e4aa682c07a50261322531" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rooms" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "connected-users" ("id" SERIAL NOT NULL, "socketId" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_a0def386015108d850c36be4849" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "username" character varying NOT NULL, "bio" character varying NOT NULL DEFAULT '', "image" character varying NOT NULL DEFAULT '', "password" character varying NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "cover" character varying NOT NULL DEFAULT '', CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "articles" ("id" SERIAL NOT NULL, "slug" character varying NOT NULL, "title" character varying NOT NULL, "body" character varying NOT NULL DEFAULT '', "description" character varying NOT NULL DEFAULT '', "cover" character varying NOT NULL DEFAULT '', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "tagList" text NOT NULL, "favouritesCount" integer NOT NULL DEFAULT '0', "authorId" integer, "categoryId" integer, CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "follows" ("id" SERIAL NOT NULL, "followerId" integer NOT NULL, "followingId" integer NOT NULL, CONSTRAINT "PK_8988f607744e16ff79da3b8a627" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tags" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rooms_users_users" ("roomsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_ec0e74b500eaad3d92f5179fb01" PRIMARY KEY ("roomsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cbe951142bc45a33a744256516" ON "rooms_users_users" ("roomsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6b3c5f4bbfb29a84a57e442af5" ON "rooms_users_users" ("usersId") `);
        await queryRunner.query(`CREATE TABLE "users_favourites_articles" ("usersId" integer NOT NULL, "articlesId" integer NOT NULL, CONSTRAINT "PK_15142a371ce15e21a3748836328" PRIMARY KEY ("usersId", "articlesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_eae017be85b24a65cc7e7c7409" ON "users_favourites_articles" ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5079edf4805dd662e42221df22" ON "users_favourites_articles" ("articlesId") `);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_4548cc4a409b8651ec75f70e280" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_b0011304ebfcb97f597eae6c31f" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_4838cd4fc48a6ff2d4aa01aa646" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_aaa8a6effc7bd20a1172d3a3bc8" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "joined-rooms" ADD CONSTRAINT "FK_b0d05f3b9cc9d89dbfe96620ca5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "joined-rooms" ADD CONSTRAINT "FK_1c02a7506b265f1e8c61c8c30f4" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "connected-users" ADD CONSTRAINT "FK_3f0609d57efc68ecec5019fbd2b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "articles" ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "articles" ADD CONSTRAINT "FK_9cf383b5c60045a773ddced7f23" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rooms_users_users" ADD CONSTRAINT "FK_cbe951142bc45a33a744256516d" FOREIGN KEY ("roomsId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "rooms_users_users" ADD CONSTRAINT "FK_6b3c5f4bbfb29a84a57e442af54" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_favourites_articles" ADD CONSTRAINT "FK_eae017be85b24a65cc7e7c74092" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_favourites_articles" ADD CONSTRAINT "FK_5079edf4805dd662e42221df221" FOREIGN KEY ("articlesId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_favourites_articles" DROP CONSTRAINT "FK_5079edf4805dd662e42221df221"`);
        await queryRunner.query(`ALTER TABLE "users_favourites_articles" DROP CONSTRAINT "FK_eae017be85b24a65cc7e7c74092"`);
        await queryRunner.query(`ALTER TABLE "rooms_users_users" DROP CONSTRAINT "FK_6b3c5f4bbfb29a84a57e442af54"`);
        await queryRunner.query(`ALTER TABLE "rooms_users_users" DROP CONSTRAINT "FK_cbe951142bc45a33a744256516d"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_9cf383b5c60045a773ddced7f23"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34"`);
        await queryRunner.query(`ALTER TABLE "connected-users" DROP CONSTRAINT "FK_3f0609d57efc68ecec5019fbd2b"`);
        await queryRunner.query(`ALTER TABLE "joined-rooms" DROP CONSTRAINT "FK_1c02a7506b265f1e8c61c8c30f4"`);
        await queryRunner.query(`ALTER TABLE "joined-rooms" DROP CONSTRAINT "FK_b0d05f3b9cc9d89dbfe96620ca5"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_aaa8a6effc7bd20a1172d3a3bc8"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_4838cd4fc48a6ff2d4aa01aa646"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_b0011304ebfcb97f597eae6c31f"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4548cc4a409b8651ec75f70e280"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5079edf4805dd662e42221df22"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_eae017be85b24a65cc7e7c7409"`);
        await queryRunner.query(`DROP TABLE "users_favourites_articles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6b3c5f4bbfb29a84a57e442af5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cbe951142bc45a33a744256516"`);
        await queryRunner.query(`DROP TABLE "rooms_users_users"`);
        await queryRunner.query(`DROP TABLE "tags"`);
        await queryRunner.query(`DROP TABLE "follows"`);
        await queryRunner.query(`DROP TABLE "articles"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "connected-users"`);
        await queryRunner.query(`DROP TABLE "rooms"`);
        await queryRunner.query(`DROP TABLE "joined-rooms"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "comments"`);
    }

}
