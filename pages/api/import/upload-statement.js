import { IncomingForm } from 'formidable';
import fs from "fs";
import path from 'path';
import { authenticate } from "@/utils/backend/authMiddleware";
import { extractPdfTable } from "@/utils/backend/parsePDFText";


// Disable Next.js default body parser
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    const userId = authenticate(req);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }


    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const uploadDir = path.join(process.cwd(), '/uploads');

    const form = new IncomingForm({
        keepExtensions: true,
        uploadDir,
        maxFileSize: 10 * 1024 * 1024, // 10 MB
        filter: part => part.mimetype === 'application/pdf',
    });

    let uploadedFile;

    try {
        const [fields, files] = await form.parse(req);
        const bank = fields.bank?.[0] || "AXIS";

        uploadedFile = files.pdf?.[0];
        if (!uploadedFile) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        const transactions = await extractPdfTable(uploadedFile.filepath, bank);

        return res.status(200).json({
            success: true,
            filename: uploadedFile.originalFilename,
            transactions
        });


    } catch (err) {
        console.error('[Upload error]', err);
        return res.status(500).json({
            error: 'Upload failed',
            details: err.message,
        });

    } finally {
        // delete file if it exists
        if (uploadedFile && uploadedFile.filepath && fs.existsSync(uploadedFile.filepath)) {
            try {
                fs.unlinkSync(uploadedFile.filepath);
            } catch (unlinkErr) {
                console.error('[File cleanup error]', unlinkErr);
            }
        }
    }
}




