import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateCateogries1635871662295 implements MigrationInterface {
    name = 'CreateCateogries1635871662295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "cover" character varying NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "categoryId" integer`);
        await queryRunner.query(`ALTER TABLE "articles" ADD CONSTRAINT "FK_9cf383b5c60045a773ddced7f23" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_9cf383b5c60045a773ddced7f23"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "categoryId"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
