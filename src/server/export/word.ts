import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  PageOrientation,
  ImageRun,
} from 'docx';
import { FormDataRecord } from '../../types/index.js';

const COLOR_HEADER_BG = '2F5597'; // Blue header from PDF
const COLOR_HEADER_TEXT = 'FFFFFF';
const COLOR_BORDER = '7F7F7F';
const FONT_FAMILY = 'Arial';

function createBorder() {
  return {
    style: BorderStyle.SINGLE,
    size: 4,
    color: COLOR_BORDER,
  };
}

const tableBorders = {
  top: createBorder(),
  bottom: createBorder(),
  left: createBorder(),
  right: createBorder(),
  insideHorizontal: createBorder(),
  insideVertical: createBorder(),
};

function headerCell(text: string, widthPercent?: number): TableCell {
  return new TableCell({
    width: widthPercent ? { size: widthPercent, type: WidthType.PERCENTAGE } : undefined,
    shading: { fill: COLOR_HEADER_BG },
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text,
            bold: true,
            color: COLOR_HEADER_TEXT,
            font: FONT_FAMILY,
            size: 16, // 8pt
          }),
        ],
      }),
    ],
  });
}

function dataCell(text: string, widthPercent?: number, align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.CENTER): TableCell {
  const displayVal = text && text.trim() !== '' ? text : 'N/A';
  const lines = displayVal.split('\n');

  return new TableCell({
    width: widthPercent ? { size: widthPercent, type: WidthType.PERCENTAGE } : undefined,
    margins: { top: 80, bottom: 80, left: 80, right: 80 },
    children: lines.map(
      (line) =>
        new Paragraph({
          alignment: align,
          children: [
            new TextRun({
              text: line,
              font: FONT_FAMILY,
              size: 15, // 7.5pt
            }),
          ],
        })
    ),
  });
}

export function createHeaderParagraphs(form: FormDataRecord): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: '[ CONFIDENTIAL ]',
          bold: true,
          font: FONT_FAMILY,
          size: 18,
          color: '333333',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'FORMULIR DOKUMENTASI ASET PROYEK TI',
          bold: true,
          font: FONT_FAMILY,
          size: 24,
          color: '0A4DA2',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: `No. Registrasi: ${form.registrationNo || 'N/A'}     |     Tanggal: ${form.registrationDate || 'N/A'}`,
          font: FONT_FAMILY,
          size: 16,
          color: '555555',
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '____________________________________________________________________________________________________________________',
          color: '0A4DA2',
        }),
      ],
    }),
  ];
}

export function createFooterNote(pageNumber: number): Paragraph[] {
  return [
    new Paragraph({ spacing: { before: 150 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Notes:\n* Seluruh kolom bersifat mandatory dan informasi yang perlu dicantumkan meliputi seluruh system environment.',
          italics: true,
          font: FONT_FAMILY,
          size: 14,
          color: '444444',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Page ${pageNumber}`,
          font: FONT_FAMILY,
          size: 16,
          color: '777777',
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '',
          break: 1,
        }),
      ],
    }),
  ];
}

export async function generateWordDocument(form: FormDataRecord): Promise<Buffer> {
  const sectionsChildren: any[] = [];

  // ==========================================
  // PAGE 1: Project Info & Hardware
  // ==========================================
  sectionsChildren.push(...createHeaderParagraphs(form));

  // Project Info Table
  const projectInfoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          headerCell('Kode Proyek TI', 25),
          dataCell(form.kodeProyekTI, 75, AlignmentType.LEFT),
        ],
      }),
      new TableRow({
        children: [
          headerCell('Kode Aplikasi', 25),
          dataCell(form.kodeAplikasi, 75, AlignmentType.LEFT),
        ],
      }),
      new TableRow({
        children: [
          headerCell('No PKS Terbaru', 25),
          dataCell(form.noPKSTerbaru, 75, AlignmentType.LEFT),
        ],
      }),
      new TableRow({
        children: [
          headerCell('Nama Proyek TI', 25),
          dataCell(form.namaProyekTI, 75, AlignmentType.LEFT),
        ],
      }),
      new TableRow({
        children: [
          headerCell('PIHAK KEDUA', 25),
          dataCell(form.pihakKedua, 75, AlignmentType.LEFT),
        ],
      }),
    ],
  });
  sectionsChildren.push(projectInfoTable);

  sectionsChildren.push(
    new Paragraph({
      spacing: { before: 150, after: 50 },
      children: [
        new TextRun({
          text: '1. HARDWARE',
          bold: true,
          font: FONT_FAMILY,
          size: 18,
          color: '1F4E79',
        }),
      ],
    })
  );

  // Hardware Table 1
  const hwRows =
    form.hardwareList && form.hardwareList.length > 0
      ? form.hardwareList
      : [
          {
            id: '1',
            no: 'N/A',
            merk: 'N/A',
            type: 'N/A',
            serialNumber: 'N/A',
            noRak: 'N/A',
            noRakUnit: 'N/A',
            lokasi: 'N/A',
            kepemilikan: 'N/A',
            backup: 'N/A',
            jangkaWaktuMaintenance: 'N/A',
          },
        ];

  const hwTable1 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          headerCell('No', 4),
          headerCell('Merk', 11),
          headerCell('Type', 11),
          headerCell('Serial Number', 11),
          headerCell('No. Rak', 9),
          headerCell('No. Rak Unit', 9),
          headerCell('Lokasi', 11),
          headerCell('Kepemilikan\n(Sewa / Milik BTN)', 12),
          headerCell('Backup\n(Realtime / Schedule / NA)', 11),
          headerCell('Jangka Waktu Maintenance', 11),
        ],
      }),
      ...hwRows.map(
        (row, i) =>
          new TableRow({
            children: [
              dataCell(String(row.no || i + 1)),
              dataCell(row.merk),
              dataCell(row.type),
              dataCell(row.serialNumber),
              dataCell(row.noRak),
              dataCell(row.noRakUnit),
              dataCell(row.lokasi),
              dataCell(row.kepemilikan),
              dataCell(row.backup),
              dataCell(row.jangkaWaktuMaintenance),
            ],
          })
      ),
    ],
  });
  sectionsChildren.push(hwTable1);

  sectionsChildren.push(new Paragraph({ spacing: { before: 100 } }));

  // Hardware Table 2 (Specs)
  const specRows =
    form.hardwareSpecList && form.hardwareSpecList.length > 0
      ? form.hardwareSpecList
      : [
          {
            id: '1',
            no: 'N/A',
            operatingSystem: 'N/A',
            processor: 'N/A',
            ram: 'N/A',
            volumeHarddisk: 'N/A',
            softwareYangDiinstall: 'N/A',
            ipAddressHostname: 'N/A',
            tahunGoLive: 'N/A',
            eolDate: 'N/A',
            eosDate: 'N/A',
          },
        ];

  const hwTable2 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          headerCell('No', 4),
          headerCell('Operating System', 12),
          headerCell('Processor', 11),
          headerCell('RAM', 10),
          headerCell('Volume Harddisk', 11),
          headerCell('Software yang diinstall', 12),
          headerCell('IP Address & Hostname', 12),
          headerCell('Tahun Go live', 9),
          headerCell('EoL\n(End of Life) Date', 10),
          headerCell('EOS\n(End of Support) Date', 9),
        ],
      }),
      ...specRows.map(
        (row, i) =>
          new TableRow({
            children: [
              dataCell(String(row.no || i + 1)),
              dataCell(row.operatingSystem),
              dataCell(row.processor),
              dataCell(row.ram),
              dataCell(row.volumeHarddisk),
              dataCell(row.softwareYangDiinstall),
              dataCell(row.ipAddressHostname),
              dataCell(row.tahunGoLive),
              dataCell(row.eolDate),
              dataCell(row.eosDate),
            ],
          })
      ),
    ],
  });
  sectionsChildren.push(hwTable2);
  sectionsChildren.push(...createFooterNote(1));

  // ==========================================
  // PAGE 2: License
  // ==========================================
  sectionsChildren.push(...createHeaderParagraphs(form));
  sectionsChildren.push(
    new Paragraph({
      spacing: { before: 100, after: 50 },
      children: [
        new TextRun({
          text: '2. LICENSE',
          bold: true,
          font: FONT_FAMILY,
          size: 18,
          color: '1F4E79',
        }),
      ],
    })
  );

  const licRows =
    form.licenseList && form.licenseList.length > 0
      ? form.licenseList
      : [
          {
            id: '1',
            no: 'N/A',
            namaLicense: 'N/A',
            deskripsiFungsiLicense: 'N/A',
            qtyLicenseYangDibeli: 'N/A',
            qtyLicenseYangDiDeploy: 'N/A',
            serialNumberSku: 'N/A',
            versionSoftware: 'N/A',
            perpetualSubscription: 'N/A',
          },
        ];

  const licTable1 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          headerCell('No', 4),
          headerCell('Nama License', 16),
          headerCell('Deskripsi Fungsi License', 18),
          headerCell('Qty License yang dibeli', 14),
          headerCell('Qty License yang di Deploy', 14),
          headerCell('Serial Number / SKU', 13),
          headerCell('Version Software', 11),
          headerCell('Perpetual / Subscription', 10),
        ],
      }),
      ...licRows.map(
        (row, i) =>
          new TableRow({
            children: [
              dataCell(String(row.no || i + 1)),
              dataCell(row.namaLicense),
              dataCell(row.deskripsiFungsiLicense, undefined, AlignmentType.LEFT),
              dataCell(row.qtyLicenseYangDibeli),
              dataCell(row.qtyLicenseYangDiDeploy),
              dataCell(row.serialNumberSku),
              dataCell(row.versionSoftware),
              dataCell(row.perpetualSubscription),
            ],
          })
      ),
    ],
  });
  sectionsChildren.push(licTable1);

  sectionsChildren.push(new Paragraph({ spacing: { before: 100 } }));

  const princRows =
    form.licensePrincipalList && form.licensePrincipalList.length > 0
      ? form.licensePrincipalList
      : [
          {
            id: '1',
            no: 'N/A',
            namaPrincipal: 'N/A',
            ipServer: 'N/A',
            jangkaWaktuKontrak: 'N/A',
            jangkaWaktuLicense: 'N/A',
            tahunEol: 'N/A',
            tahunEos: 'N/A',
          },
        ];

  const licTable2 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          headerCell('No.', 4),
          headerCell('Nama Principal', 20),
          headerCell('IP Server', 18),
          headerCell('Jangka Waktu Kontrak', 20),
          headerCell('Jangka Waktu License', 20),
          headerCell('Tahun EOL (End Of Life)', 9),
          headerCell('Tahun EOS (End Of Support)', 9),
        ],
      }),
      ...princRows.map(
        (row, i) =>
          new TableRow({
            children: [
              dataCell(String(row.no || i + 1)),
              dataCell(row.namaPrincipal),
              dataCell(row.ipServer),
              dataCell(row.jangkaWaktuKontrak),
              dataCell(row.jangkaWaktuLicense),
              dataCell(row.tahunEol),
              dataCell(row.tahunEos),
            ],
          })
      ),
    ],
  });
  sectionsChildren.push(licTable2);
  sectionsChildren.push(...createFooterNote(2));

  // ==========================================
  // PAGE 3: Software
  // ==========================================
  sectionsChildren.push(...createHeaderParagraphs(form));
  sectionsChildren.push(
    new Paragraph({
      spacing: { before: 100, after: 50 },
      children: [
        new TextRun({
          text: '3. SOFTWARE*',
          bold: true,
          font: FONT_FAMILY,
          size: 18,
          color: '1F4E79',
        }),
      ],
    })
  );

  const swAppRows =
    form.softwareAppList && form.softwareAppList.length > 0
      ? form.softwareAppList
      : [
          {
            id: '1',
            no: 'N/A',
            namaAplikasi: 'N/A',
            deskripsiAplikasi: 'N/A',
            jenisAplikasi: 'N/A',
            kategoriServer: 'N/A',
            jenisServer: 'N/A',
            loginAuth: 'N/A',
            platformOsVersion: 'N/A',
            eosDateOs: 'N/A',
            databaseVersion: 'N/A',
            eosDateDb: 'N/A',
          },
        ];

  const swTableA = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          headerCell('No', 3),
          headerCell('Nama Aplikasi', 11),
          headerCell('Deskripsi Aplikasi', 18),
          headerCell('Jenis Aplikasi\n(Application / Appliance / Tools)', 11),
          headerCell('Kategori Server\n(Physical / Virtual / Cloud)', 10),
          headerCell('Jenis Server\n(Prod / Dev)', 9),
          headerCell('Login Auth\n(User AD / Non AD)', 9),
          headerCell('Platform / OS\nVersion', 10),
          headerCell('EoS (End of\nSupport) Date OS', 9),
          headerCell('Database\nVersion', 10),
          headerCell('EoS (End of\nSupport) Date DB', 9),
        ],
      }),
      ...swAppRows.map(
        (row, i) =>
          new TableRow({
            children: [
              dataCell(String(row.no || i + 1)),
              dataCell(row.namaAplikasi),
              dataCell(row.deskripsiAplikasi, undefined, AlignmentType.LEFT),
              dataCell(row.jenisAplikasi),
              dataCell(row.kategoriServer),
              dataCell(row.jenisServer),
              dataCell(row.loginAuth),
              dataCell(row.platformOsVersion),
              dataCell(row.eosDateOs),
              dataCell(row.databaseVersion),
              dataCell(row.eosDateDb),
            ],
          })
      ),
    ],
  });
  sectionsChildren.push(swTableA);

  sectionsChildren.push(new Paragraph({ spacing: { before: 80 } }));

  const swOwnerRows =
    form.softwareOwnerList && form.softwareOwnerList.length > 0
      ? form.softwareOwnerList
      : [
          {
            id: '1',
            no: 'N/A',
            divisiAppsOwnerUser: 'N/A',
            vendorPengembangAplikasi: 'N/A',
            namaPrincipal: 'N/A',
            tahunImplementasiGoLive: 'N/A',
            bahasaPemograman: 'N/A',
            kepemilikan: 'N/A',
            kepemilikanSourceCode: 'N/A',
            prosesBisnisYangDisupport: 'N/A',
            sistemFront: 'N/A',
          },
        ];

  const swTableB = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          headerCell('No', 3),
          headerCell('Divisi Apps Owner / User', 10),
          headerCell('Vendor Pengembang\nAplikasi', 13),
          headerCell('Nama Principal\n(*) Jika Ada', 12),
          headerCell('Tahun Implementasi\n(Go Live)', 9),
          headerCell('Bahasa Pemograman', 9),
          headerCell('Kepemilikan (Sewa / Beli\nPutus / Hak Penggunaan)', 12),
          headerCell('Kepemilikan Source Code\n(BTN / Penyedia Jasa)', 12),
          headerCell('Proses Bisnis Yang\nDisupport', 11),
          headerCell('Sistem Front\n(Web / Dekstop / Mobile)', 9),
        ],
      }),
      ...swOwnerRows.map(
        (row, i) =>
          new TableRow({
            children: [
              dataCell(String(row.no || i + 1)),
              dataCell(row.divisiAppsOwnerUser),
              dataCell(row.vendorPengembangAplikasi),
              dataCell(row.namaPrincipal),
              dataCell(row.tahunImplementasiGoLive),
              dataCell(row.bahasaPemograman),
              dataCell(row.kepemilikan),
              dataCell(row.kepemilikanSourceCode),
              dataCell(row.prosesBisnisYangDisupport),
              dataCell(row.sistemFront),
            ],
          })
      ),
    ],
  });
  sectionsChildren.push(swTableB);

  sectionsChildren.push(new Paragraph({ spacing: { before: 80 } }));

  const swIPRows =
    form.softwareIPList && form.softwareIPList.length > 0
      ? form.softwareIPList
      : [
          {
            id: '1',
            no: 'N/A',
            ipServerAppHostnameProduction: 'N/A',
            ipServerAppHostnameDevelopment: 'N/A',
            backupServerApp: 'N/A',
            ipServerDbHostnameProduction: 'N/A',
            ipServerDbHostnameDevelopment: 'N/A',
            backupServerDb: 'N/A',
          },
        ];

  const swTableC = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          headerCell('No', 3),
          headerCell('IP Server App/Hostname\nProduction', 22),
          headerCell('IP Server App/Hostname\nDevelopment', 17),
          headerCell('Backup Server App\n(Realtime/Schedule/NA)', 13),
          headerCell('IP Server DB/Hostname\nProduction', 19),
          headerCell('IP Server DB/Hostname\nDevelopment', 13),
          headerCell('Backup Server DB\n(Realtime/Schedule/NA)', 13),
        ],
      }),
      ...swIPRows.map(
        (row, i) =>
          new TableRow({
            children: [
              dataCell(String(row.no || i + 1)),
              dataCell(row.ipServerAppHostnameProduction, undefined, AlignmentType.LEFT),
              dataCell(row.ipServerAppHostnameDevelopment, undefined, AlignmentType.LEFT),
              dataCell(row.backupServerApp),
              dataCell(row.ipServerDbHostnameProduction, undefined, AlignmentType.LEFT),
              dataCell(row.ipServerDbHostnameDevelopment, undefined, AlignmentType.LEFT),
              dataCell(row.backupServerDb),
            ],
          })
      ),
    ],
  });
  sectionsChildren.push(swTableC);
  sectionsChildren.push(...createFooterNote(3));

  // ==========================================
  // PAGE 4: Signatures
  // ==========================================
  sectionsChildren.push(...createHeaderParagraphs(form));
  sectionsChildren.push(new Paragraph({ spacing: { before: 100 } }));

  // Top Section: Disusun Oleh (1 slot) & Diverifikasi Oleh (4 slots)
  const verifSlots = form.diverifikasiOleh || [];

  const sigTopTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: COLOR_HEADER_BG },
            margins: { top: 80, bottom: 80 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Disusun Oleh', bold: true, color: 'FFFFFF', size: 16 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 80, type: WidthType.PERCENTAGE },
            columnSpan: 4,
            shading: { fill: COLOR_HEADER_BG },
            margins: { top: 80, bottom: 80 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Diverifikasi Oleh', bold: true, color: 'FFFFFF', size: 16 })],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            margins: { top: 60, bottom: 60, left: 60, right: 60 },
            children: [
              new Paragraph({ children: [new TextRun({ text: `Tanggal: ${form.disusunOleh?.date || ''}`, size: 14 })] }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: form.disusunOleh?.title || 'IT Project Manager Vendor', bold: true, size: 14 })],
              }),
              new Paragraph({ spacing: { before: 300, after: 100 } }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: form.disusunOleh?.name || '(...................)', size: 15, bold: true })],
              }),
            ],
          }),
          ...verifSlots.slice(0, 4).map(
            (slot) =>
              new TableCell({
                width: { size: 20, type: WidthType.PERCENTAGE },
                margins: { top: 60, bottom: 60, left: 60, right: 60 },
                children: [
                  new Paragraph({ children: [new TextRun({ text: `Tanggal: ${slot.date || ''}`, size: 14 })] }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: slot.title || '', bold: true, size: 13 })],
                  }),
                  new Paragraph({ spacing: { before: 300, after: 100 } }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: slot.name || '(...................)', size: 15, bold: true })],
                  }),
                ],
              })
          ),
        ],
      }),
    ],
  });
  sectionsChildren.push(sigTopTable);

  sectionsChildren.push(new Paragraph({ spacing: { before: 100 } }));

  // Bottom Section: Disetujui Oleh (4 slots)
  const apprSlots = form.disetujuiOleh || [];
  const sigBottomTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnSpan: 4,
            shading: { fill: COLOR_HEADER_BG },
            margins: { top: 80, bottom: 80 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Disetujui Oleh', bold: true, color: 'FFFFFF', size: 16 })],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: apprSlots.slice(0, 4).map(
          (slot) =>
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              margins: { top: 60, bottom: 60, left: 60, right: 60 },
              children: [
                new Paragraph({ children: [new TextRun({ text: `Tanggal: ${slot.date || ''}`, size: 14 })] }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: slot.title || '', bold: true, size: 13 })],
                }),
                new Paragraph({ spacing: { before: 300, after: 100 } }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: slot.name || '(...................)', size: 15, bold: true })],
                }),
              ],
            })
        ),
      }),
    ],
  });
  sectionsChildren.push(sigBottomTable);
  sectionsChildren.push(...createFooterNote(4));

  // ==========================================
  // ATTACHMENT PAGES (Lampiran:)
  // ==========================================
  if (form.attachments && form.attachments.length > 0) {
    let attPage = 5;
    for (const att of form.attachments) {
      sectionsChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Lampiran:',
              bold: true,
              italics: true,
              font: FONT_FAMILY,
              size: 20,
              underline: {},
            }),
          ],
        }),
        new Paragraph({
          spacing: { before: 50, after: 150 },
          children: [
            new TextRun({
              text: `File: ${att.fileName}`,
              font: FONT_FAMILY,
              size: 16,
              color: '555555',
            }),
          ],
        })
      );

      // If attachment is an image with base64 dataUrl, embed it
      if (att.dataUrl && att.dataUrl.startsWith('data:image/')) {
        try {
          const base64Data = att.dataUrl.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          sectionsChildren.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new ImageRun({
                  data: buffer,
                  transformation: {
                    width: 700,
                    height: 420,
                  },
                  type: 'png',
                }),
              ],
            })
          );
        } catch (imgErr) {
          console.warn('[Word Export] Failed to insert image attachment:', imgErr);
        }
      }

      sectionsChildren.push(...createFooterNote(attPage));
      attPage++;
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
              width: 16838, // A4 Landscape (11.69 inches * 1440)
              height: 11906, // 8.27 inches * 1440
            },
            margin: {
              top: 720, // 0.5 inch
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: sectionsChildren,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
