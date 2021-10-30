import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCoverToArticles1635506801568 implements MigrationInterface {
    name = 'AddCoverToArticles1635506801568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ADD "cover" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "cover"`);
    }

}
