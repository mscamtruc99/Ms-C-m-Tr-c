import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import { LessonPlan } from '../types';
import { getSanitizedTeacherName } from './teacherUtils';

export function generateDocxDocument(lessonPlan: LessonPlan): Document {
  const {
    generalInfo,
    teacherInfo,
    objectives = { qualities: [], generalCompetencies: [], subjectCompetencies: [] },
    equipment = { teacher: [], students: [], digitalTools: [], stemKits: [] },
    procedure = [],
    aiIntegrationDetail = { aiEthicsRules: [], criticalQuestions: [], promptEngineeringTips: [] },
    digitalCompetencyMatrix = [],
    stemDetail,
    assessmentRubric = [],
  } = lessonPlan;

  const schoolName = (teacherInfo?.school || 'THCS').toUpperCase();
  const departmentName = (teacherInfo?.department || 'Tổ Chuyên Môn').toUpperCase();
  const teacherName = getSanitizedTeacherName(
    teacherInfo?.fullName,
    generalInfo?.subject,
    generalInfo?.grade
  );
  const textbookName = generalInfo?.textbook || 'Kết nối tri thức với cuộc sống';
  const subjectName = (generalInfo?.subject || 'Tin học').toUpperCase();
  const gradeName = (generalInfo?.grade || 'Lớp 8').toUpperCase();
  const lessonTitle = generalInfo?.lessonTitle || 'Kế hoạch bài dạy';
  const durationText = generalInfo?.duration || '1 tiết (45 phút)';
  const lessonNumberText = generalInfo?.lessonNumber || 'Tiết 1';
  const topicText = generalInfo?.topic || 'Chủ đề bài học';

  // Primary heading font & styling
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
          },
        },
      },
    },
    sections: [
      {
        properties: {},
        children: [
          // Header Table: School & Teacher info
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: '2B6CB0' },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: `TRƯỜNG: ${schoolName}`, bold: true, size: 20 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: `TỔ CHUYÊN MÔN: ${departmentName}`, size: 18 }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({ text: `Họ và tên giáo viên: `, bold: true, size: 20 }),
                          new TextRun({ text: teacherName, size: 20 }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({ text: `Bộ sách: ${textbookName}`, italics: true, size: 18 }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Document Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({ text: 'KẾ HOẠCH BÀI DẠY (GIÁO ÁN)', bold: true, size: 28, color: '1A365D' }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `MÔN HỌC: ${subjectName} - ${gradeName}`, bold: true, size: 22, color: '2B6CB0' }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `TÊN BÀI HỌC: ${lessonTitle}`, bold: true, size: 24, color: '1A202C' }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `Thời lượng: ${durationText} (${lessonNumberText})`, italics: true, size: 20 }),
            ],
            spacing: { after: 300 },
          }),

          // I. THÔNG TIN CHUNG
          createSectionHeading('I. THÔNG TIN CHUNG'),
          new Paragraph({
            children: [
              new TextRun({ text: `• Môn học: `, bold: true }),
              new TextRun({ text: `${generalInfo?.subject || ''} - ${generalInfo?.grade || ''}` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `• Chủ đề bài học: `, bold: true }),
              new TextRun({ text: topicText }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `• Bộ sách giáo khoa: `, bold: true }),
              new TextRun({ text: textbookName }),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 200 } }),

          // II. MỤC TIÊU BÀI HỌC
          createSectionHeading('II. MỤC TIÊU BÀI HỌC (Chuẩn GDPT 2018)'),
          createSubHeading('1. Phẩm chất chủ yếu'),
          ...(objectives?.qualities || []).map((item) => new Paragraph({ children: [new TextRun({ text: `• ${item}` })] })),

          createSubHeading('2. Năng lực chung'),
          ...(objectives?.generalCompetencies || []).map((item) => new Paragraph({ children: [new TextRun({ text: `• ${item}` })] })),

          createSubHeading('3. Năng lực đặc thù môn học'),
          ...(objectives?.subjectCompetencies || []).map((item) => new Paragraph({ children: [new TextRun({ text: `• ${item}` })] })),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // III. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
          createSectionHeading('III. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU'),
          new Paragraph({
            children: [
              new TextRun({ text: '1. Giáo viên: ', bold: true }),
              new TextRun({ text: (equipment?.teacher || []).join('; ') }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '2. Học sinh: ', bold: true }),
              new TextRun({ text: (equipment?.students || []).join('; ') }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3. Công cụ AI & Phần mềm số: ', bold: true }),
              new TextRun({ text: (equipment?.digitalTools || []).join(', ') }),
            ],
          }),
          (equipment?.stemKits && equipment.stemKits.length > 0)
            ? new Paragraph({
                children: [
                  new TextRun({ text: '4. Học liệu / Thiết bị STEM: ', bold: true }),
                  new TextRun({ text: equipment.stemKits.join(', ') }),
                ],
              })
            : new Paragraph({ text: '' }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // IV. TIẾN TRÌNH DẠY HỌC
          createSectionHeading('IV. TIẾN TRÌNH DẠY HỌC (Chuẩn Công văn 5512)'),
          ...(procedure || []).flatMap((act) => [
            createSubHeading(`${(act.typeLabel || 'HOẠT ĐỘNG').toUpperCase()}: ${act.title || ''}`),
            new Paragraph({
              children: [
                new TextRun({ text: 'a) Mục tiêu: ', bold: true, color: '2B6CB0' }),
                new TextRun({ text: act.objectives || '' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'b) Nội dung: ', bold: true, color: '2B6CB0' }),
                new TextRun({ text: act.content || '' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'c) Sản phẩm: ', bold: true, color: '2B6CB0' }),
                new TextRun({ text: act.product || '' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'd) Tổ chức thực hiện:', bold: true, color: '2B6CB0' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '   • Bước 1: Chuyển giao nhiệm vụ: ', bold: true }),
                new TextRun({ text: act.organization?.step1_Transfer || '' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '   • Bước 2: Thực hiện nhiệm vụ: ', bold: true }),
                new TextRun({ text: act.organization?.step2_Perform || '' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '   • Bước 3: Báo cáo, thảo luận: ', bold: true }),
                new TextRun({ text: act.organization?.step3_Discuss || '' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '   • Bước 4: Kết luận, nhận định: ', bold: true }),
                new TextRun({ text: act.organization?.step4_Conclude || '' }),
              ],
            }),
            act.aiIntegrationNote
              ? new Paragraph({
                  children: [
                    new TextRun({ text: '   [Tích hợp AI/Số]: ', bold: true, color: '2F855A' }),
                    new TextRun({ text: act.aiIntegrationNote, italics: true }),
                  ],
                })
              : new Paragraph({ text: '' }),
            new Paragraph({ text: '', spacing: { after: 150 } }),
          ]),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // V. TÍCH HỢP AI & MA TRẬN NĂNG LỰC SỐ
          createSectionHeading('V. MA TRẬN NĂNG LỰC SỐ & TÍCH HỢP TRÍ TUỆ NHÂN TẠO (AI)'),
          createSubHeading('1. Ma trận Năng lực số (DigComp / Khung Bộ GD&ĐT)'),
          createDigitalCompTable(digitalCompetencyMatrix || []),

          createSubHeading('2. Quy tắc Đạo đức AI & Kiểm chứng Thông tin'),
          ...((aiIntegrationDetail?.aiEthicsRules || []).map((rule) =>
            new Paragraph({ children: [new TextRun({ text: `• ${rule}` })] })
          )),

          createSubHeading('3. Câu hỏi Phản biện AI cho Học sinh'),
          ...((aiIntegrationDetail?.criticalQuestions || []).map((q) =>
            new Paragraph({ children: [new TextRun({ text: `? ${q}`, italics: true })] })
          )),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // VI. STEM & RUBRIC ĐÁNH GIÁ
          stemDetail
            ? createSectionHeading('VI. ĐỊNH HƯỚNG STEM / STEAM BÀI HỌC')
            : new Paragraph({ text: '' }),
          ...(stemDetail
            ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Vấn đề thực tiễn: ', bold: true }),
                    new TextRun({ text: stemDetail.realWorldProblem || '' }),
                  ],
                }),
                createSubHeading('Quy trình Thiết kế Kỹ thuật STEM:'),
                ...(stemDetail.designProcess || []).map((step) =>
                  new Paragraph({ children: [new TextRun({ text: `→ ${step}` })] })
                ),
                new Paragraph({ text: '', spacing: { after: 150 } }),
              ]
            : []),

          createSectionHeading('VII. RUBRIC ĐÁNH GIÁ NĂNG LỰC (4 MỨC ĐỘ)'),
          createRubricTable(assessmentRubric || []),
        ],
      },
    ],
  });

  return doc;
}

export async function generateDocxBlob(lessonPlan: LessonPlan): Promise<{ blob: Blob; fileName: string }> {
  const doc = generateDocxDocument(lessonPlan);
  const blob = await Packer.toBlob(doc);
  const generalInfo = lessonPlan.generalInfo;
  const cleanTitle = (generalInfo?.lessonTitle || 'GiaoAn').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 30);
  const cleanSubject = (generalInfo?.subject || 'MonHoc').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const cleanGrade = (generalInfo?.grade || 'Lop').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const fileName = `KHBD_${cleanSubject}_${cleanGrade}_${cleanTitle}.docx`;
  return { blob, fileName };
}

export async function exportLessonPlanToDocx(lessonPlan: LessonPlan): Promise<void> {
  const { blob, fileName } = await generateDocxBlob(lessonPlan);
  saveAs(blob, fileName);
}

function createSectionHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [
      new TextRun({ text, bold: true, size: 22, color: '1A365D', font: 'Times New Roman' }),
    ],
    spacing: { before: 200, after: 100 },
  });
}

function createSubHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [
      new TextRun({ text, bold: true, size: 20, color: '2B6CB0', font: 'Times New Roman' }),
    ],
    spacing: { before: 100, after: 50 },
  });
}

function createDigitalCompTable(items: { competency: string; activityApplied: string; evidence: string }[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mục Năng lực số', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Hoạt động áp dụng', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Minh chứng / Sản phẩm', bold: true })] })] }),
        ],
      }),
      ...items.map(
        (item) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.competency })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.activityApplied })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.evidence })] })] }),
            ],
          })
      ),
    ],
  });
}

function createRubricTable(rubrics: { criteria: string; levelUnsatisfactory: string; levelSatisfactory: string; levelGood: string; levelExcellent: string }[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Tiêu chí', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Chưa đạt', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Đạt', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Khá', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Tốt / Xuất sắc', bold: true })] })] }),
        ],
      }),
      ...rubrics.map(
        (r) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.criteria, bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.levelUnsatisfactory })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.levelSatisfactory })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.levelGood })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.levelExcellent })] })] }),
            ],
          })
      ),
    ],
  });
}
