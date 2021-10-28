import {MigrationInterface, QueryRunner} from "typeorm";

export class AddFavouritesRealationsBetweenArticlesAndUsers1634997541780 implements MigrationInterface {
    name = 'AddFavouritesRealationsBetweenArticlesAndUsers1634997541780'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users_favourites_articles" ("usersId" integer NOT NULL, "articlesId" integer NOT NULL, CONSTRAINT "PK_15142a371ce15e21a3748836328" PRIMARY KEY ("usersId", "articlesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_eae017be85b24a65cc7e7c7409" ON "users_favourites_articles" ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5079edf4805dd662e42221df22" ON "users_favourites_articles" ("articlesId") `);
        await queryRunner.query(`ALTER TABLE "users_favourites_articles" ADD CONSTRAINT "FK_eae017be85b24a65cc7e7c74092" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_favourites_articles" ADD CONSTRAINT "FK_5079edf4805dd662e42221df221" FOREIGN KEY ("articlesId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_favourites_articles" DROP CONSTRAINT "FK_5079edf4805dd662e42221df221"`);
        await queryRunner.query(`ALTER TABLE "users_favourites_articles" DROP CONSTRAINT "FK_eae017be85b24a65cc7e7c74092"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5079edf4805dd662e42221df22"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_eae017be85b24a65cc7e7c7409"`);
        await queryRunner.query(`DROP TABLE "users_favourites_articles"`);
    }

}
