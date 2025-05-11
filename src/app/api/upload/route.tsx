import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const names: string[] = [
    "Achille De Vriese",
    "Alexander Dubois",
    "Amélie Niesten",
    "Amélie Van den Heuvel",
    "Annemerel Bobbaers",
    "Bram Verbelen",
    "Brent De Peuter",
    "Charles De Beir",
    "Charlotte Severyns",
    "Diete Wouters",
    "Driek Rediers",
    "Dries Vandevoort",
    "Elize Bonten",
    "Emily Denys",
    "Emma Jans",
    "Fien Servranckx",
    "Gilles Sempels",
    "Henri Mesman",
    "Hugo Van Nuffel",
    "Ian Mertens",
    "Jakob De Meyere",
    "Jarne Plessers",
    "Jef De Koker",
    "Jinne Nijs",
    "Jules Legrand",
    "Jussi Gysemans",
    "Kato Loeckx",
    "Kenny Nwosu",
    "Kwinten Lowie",
    "Lander De Veuster",
    "Lander Verhoeven",
    "Lars Lagauw",
    "Lien Merckx",
    "Lisa Corten",
    "Lore Bellen",
    "Lucas Fonderie",
    "Lucas Renard",
    "Lucy Vande Sande",
    "Maarten Haine",
    "Marian Van Alphen",
    "Marie Lampaert",
    "Marie-Johanna Schillemans",
    "Marte Maes",
    "Martijn Berger",
    "Matthias Van Strydonck",
    "Matthijs De Haeck",
    "Matti Boelen",
    "Mattias Duysters",
    "Mauro Van Tichelen",
    "Michiel Huysmans",
    "Milo Van Aelst",
    "Nando De Rijck",
    "Nando Quishpe",
    "Noah Steinier",
    "Oscar Peersman",
    "Patryk Borzym",
    "Phelps van den Bosch",
    "Pierre Harmant",
    "Pierre Stavart",
    "Quinten Van de Reyde",
    "Rémi Mentens",
    "Robbe Mensch",
    "Robbe Serry",
    "Robbe Van Royen",
    "Robin De Becker",
    "Robin Van Looveren",
    "Ruben De Block",
    "Sander Deroover",
    "Sepp Swinnen",
    "Seppe Van der Biest",
    "Seppe Van Gelder",
    "Thiago Thielemans",
    "Thomas Billiet",
    "Tiddo Nees",
    "Tiemen Moeyersons",
    "Timon Dries",
    "Tobias De Clercq",
    "Tom Moermans",
    "Victor Moeys",
    "Viktor Meekers",
    "Vincent Ramharter",
    "Wannes Huygh",
    "Willem Bormans",
    "Wout Raspoet",
    "Xander Depauw",
    "Yana Possemiers",
    "Yannick Pâquet"
];

export const POST = async (req: NextRequest) => {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file || file.type !== 'text/html') {
        return NextResponse.json({ error: 'Invalid or missing HTML file.' }, { status: 400 });
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const html = buffer.toString('utf-8');
        const $ = cheerio.load(html);

        // Parse style block for color mapping
        const styleContent = $('style').html() || '';
        const classColorMap: Record<string, string> = {};
        const styleRegex = /\.(c\d+)\s*{[^}]*color:\s*(#[0-9a-fA-F]{6})/g;
        let match;
        while ((match = styleRegex.exec(styleContent)) !== null) {
            classColorMap[match[1]] = match[2].toLowerCase();
        }

        const aanwezig: string[] = [];
        const verontschuldigd: string[] = [];
        const afwezig: string[] = [];

        $('span').each((_, el) => {
            const className = $(el).attr('class') || '';
            const text = $(el).text().trim();
            if (!text) return;
            if (!names.includes(text)) return;

            const classes = className.split(/\s+/);
            let color = '';
            for (const cls of classes) {
                if (classColorMap[cls]) {
                    color = classColorMap[cls];
                    break;
                }
            }

            switch (color) {
                case '#6aa84f':
                    aanwezig.push(text);
                    break;
                case '#38761d':
                    aanwezig.push(text);
                    break;
                case '#e69138':
                    verontschuldigd.push(text);
                    break;
                case '#000000':
                case '#cc0000':
                default:
                    afwezig.push(text);
                    break;
            }
        });

        return NextResponse.json({ aanwezig, verontschuldigd, afwezig });
    } catch (err) {
        console.error('Upload parse error:', err);
        return NextResponse.json({ error: 'Failed to parse uploaded HTML.' }, { status: 500 });
    }
};
