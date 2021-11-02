import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeCategoryCover1635872719101 implements MigrationInterface {
    name = 'ChangeCategoryCover1635872719101'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "cover" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "cover" DROP DEFAULT`);
    }

}
