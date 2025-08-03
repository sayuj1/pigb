import { parseIcici } from './extractors/icici';
import { parseAxis } from './extractors/axis';
import fs from "fs";
import pdf2table from 'pdf2table';


export function extractPdfTable(filePath, bank) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, buffer) => {
            if (err) return reject(err);

            pdf2table.parse(buffer, (err, rows) => {
                if (err) return reject(err);

                try {
                    let transactions;

                    switch (bank.toUpperCase()) {
                        case "ICICI":
                            transactions = parseIcici(rows);
                            break;
                        case "AXIS":
                        default:
                            transactions = parseAxis(rows);
                            break;
                    }

                    resolve(transactions);
                } catch (parseError) {
                    reject(parseError);
                }
            });
        });
    });
}


