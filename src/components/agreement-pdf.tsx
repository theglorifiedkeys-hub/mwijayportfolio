import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Image
} from '@react-pdf/renderer';
import { format } from 'date-fns';

/**
 * Registry Note: We use standard PDF fonts (Helvetica) instead of Inter 
 * to ensure 100% reliability and zero "Failed to fetch" errors.
 */
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111111',
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 60,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 24,
    borderBottom: '2px solid #111111',
    marginBottom: 36,
  },
  brandName: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  brandSub: {
    fontSize: 8,
    color: '#888888',
    marginTop: 4,
    fontFamily: 'Helvetica',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 7,
    color: '#aaaaaa',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },

  /* ── Title block ── */
  titleBlock: {
    alignItems: 'center',
    marginBottom: 40,
  },
  projectTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  projectSub: {
    fontSize: 8,
    color: '#888888',
    marginTop: 6,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
  },
  agreementIdPill: {
    marginTop: 10,
    backgroundColor: '#eff6ff',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  agreementIdText: {
    fontSize: 8,
    color: '#2563eb',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  /* ── Sections ── */
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 8,
    borderBottom: '1px solid #e5e7eb',
  },
  sectionDot: {
    width: 6,
    height: 6,
    backgroundColor: '#2563eb',
    borderRadius: 3,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#2563eb',
  },

  /* ── Grid ── */
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: '50%',
    marginBottom: 14,
    paddingRight: 20,
  },
  gridCellFull: {
    width: '100%',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 7,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
  },
  fieldValueAccent: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
  },

  /* ── Description box ── */
  descBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 14,
    marginTop: 4,
  },
  descText: {
    fontSize: 10,
    lineHeight: 1.7,
    color: '#374151',
    fontFamily: 'Helvetica',
  },
  featuresBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 14,
    marginTop: 4,
  },
  featuresText: {
    fontSize: 10,
    lineHeight: 1.7,
    color: '#2563eb',
    fontFamily: 'Helvetica-Bold',
  },

  /* ── Payment pill ── */
  pill: {
    backgroundColor: '#eff6ff',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  pillText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* ── Client signature block ── */
  clientSigBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderStyle: 'dashed',
  },
  clientSigLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  clientSigName: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    letterSpacing: -1,
    marginBottom: 10,
  },
  authBadge: {
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  authBadgeText: {
    fontSize: 7,
    color: '#16a34a',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* ── Dual signature row ── */
  sigRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 40,
    paddingTop: 32,
    borderTop: '2px solid #111111',
  },
  sigBlock: {
    flex: 1,
  },
  sigLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  sigLine: {
    borderBottom: '1.5px solid #111111',
    height: 70,
    marginBottom: 8,
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  sigName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sigRole: {
    fontSize: 7,
    color: '#9ca3af',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  adminSigImage: {
    height: 60,
    objectFit: 'contain',
    objectPositionX: 0,
  },

  /* ── Footer ── */
  footer: {
    position: 'absolute',
    bottom: 36,
    left: 60,
    right: 60,
    borderTop: '1px solid #e5e7eb',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: '#d1d5db',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pageNumber: {
    fontSize: 7,
    color: '#d1d5db',
    fontFamily: 'Helvetica-Bold',
  },
});

interface AgreementPDFProps {
  agreement: any;
  adminSignature: string | null;
}

export function AgreementPDF({ agreement, adminSignature }: AgreementPDFProps) {
  const submittedDate = agreement.submittedAt
    ? format(agreement.submittedAt.toDate(), 'MMMM dd, yyyy')
    : '—';

  const generatedDate = format(new Date(), 'MMMM dd, yyyy');

  return (
    <Document
      title={`Agreement — ${agreement.project?.title}`}
      author="Mwijay Services"
      subject="Service Agreement"
      creator="Mwijay Services Platform"
      producer="Mwijay Services"
    >
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header} fixed>
          <View>
            <Text style={s.brandName}>Mwijay Services</Text>
            <Text style={s.brandSub}>Web Developer & AI Specialist — Dar es Salaam, Tanzania</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.metaLabel}>Agreement ID</Text>
            <Text style={s.metaValue}>{agreement.agreementId}</Text>
            <Text style={s.metaLabel}>Submitted</Text>
            <Text style={s.metaValue}>{submittedDate}</Text>
          </View>
        </View>

        {/* ── Title ── */}
        <View style={s.titleBlock}>
          <Text style={s.projectTitle}>{agreement.project?.title || 'System Build'}</Text>
          <Text style={s.projectSub}>Service Agreement & Project Contract</Text>
          <View style={s.agreementIdPill}>
            <Text style={s.agreementIdText}>{agreement.agreementId}</Text>
          </View>
        </View>

        {/* ── Client Information ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionDot} />
            <Text style={s.sectionTitle}>Client Information</Text>
          </View>
          <View style={s.grid2}>
            <View style={s.gridCell}>
              <Text style={s.fieldLabel}>Full Legal Name</Text>
              <Text style={s.fieldValue}>{agreement.client?.name}</Text>
            </View>
            <View style={s.gridCell}>
              <Text style={s.fieldLabel}>Organization</Text>
              <Text style={s.fieldValue}>{agreement.client?.businessName || 'Independent'}</Text>
            </View>
            <View style={s.gridCell}>
              <Text style={s.fieldLabel}>Email Address</Text>
              <Text style={s.fieldValueAccent}>{agreement.client?.email}</Text>
            </View>
            <View style={s.gridCell}>
              <Text style={s.fieldLabel}>Phone Number</Text>
              <Text style={s.fieldValue}>{agreement.client?.phone}</Text>
            </View>
            <View style={s.gridCellFull}>
              <Text style={s.fieldLabel}>Location</Text>
              <Text style={s.fieldValue}>{agreement.client?.city || 'Tanzania'}</Text>
            </View>
          </View>
        </View>

        {/* ── Project Details ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionDot} />
            <Text style={s.sectionTitle}>Project Details</Text>
          </View>
          <View style={s.gridCellFull}>
            <Text style={s.fieldLabel}>Service Type</Text>
            <Text style={s.fieldValue}>{agreement.project?.serviceType}</Text>
          </View>
          <View style={{ marginBottom: 12 }}>
            <Text style={s.fieldLabel}>Project Description</Text>
            <View style={s.descBox}>
              <Text style={s.descText}>{agreement.project?.description}</Text>
            </View>
          </View>
          {agreement.project?.features && (
            <View>
              <Text style={s.fieldLabel}>Technical Features</Text>
              <View style={s.featuresBox}>
                <Text style={s.featuresText}>{agreement.project?.features}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Financial Terms ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionDot} />
            <Text style={s.sectionTitle}>Financial Terms & Timeline</Text>
          </View>
          <View style={s.grid2}>
            <View style={s.gridCell}>
              <Text style={s.fieldLabel}>Budget Range</Text>
              <Text style={s.fieldValue}>{agreement.timeline?.budgetRange}</Text>
            </View>
            <View style={s.gridCell}>
              <Text style={s.fieldLabel}>Target Delivery</Text>
              <Text style={s.fieldValue}>{agreement.timeline?.completionDate || 'Flexible'}</Text>
            </View>
            <View style={s.gridCellFull}>
              <Text style={s.fieldLabel}>Payment Method</Text>
              <View style={s.pill}>
                <Text style={s.pillText}>{agreement.timeline?.paymentMethod}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Client Signature ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionDot} />
            <Text style={s.sectionTitle}>Client Authentication</Text>
          </View>
          <View style={s.clientSigBox}>
            <Text style={s.clientSigLabel}>Digital Identity Signature</Text>
            <Text style={s.clientSigName}>{agreement.signature?.typedName}</Text>
            <View style={s.authBadge}>
              <Text style={s.authBadgeText}>Electronically Authenticated ✓</Text>
            </View>
          </View>
        </View>

        {/* ── Dual Signature Row ── */}
        <View style={s.sigRow}>
          {/* Client */}
          <View style={s.sigBlock}>
            <Text style={s.sigLabel}>Client Signature</Text>
            <View style={s.sigLine}>
              <Text style={{ fontSize: 24, fontFamily: 'Helvetica-Bold' }}>
                {agreement.signature?.typedName}
              </Text>
            </View>
            <Text style={s.sigName}>{agreement.client?.name}</Text>
            <Text style={s.sigRole}>Client — Electronically Signed</Text>
          </View>

          {/* Admin */}
          <View style={s.sigBlock}>
            <Text style={s.sigLabel}>Service Provider Signature</Text>
            <View style={s.sigLine}>
              {adminSignature && (
                <Image src={adminSignature} style={s.adminSigImage} />
              )}
            </View>
            <Text style={s.sigName}>Mwijay Davie</Text>
            <Text style={s.sigRole}>Mwijay Services — Authorized Representative</Text>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Mwijay Services · mwijayportfolio.vercel.app · Generated {generatedDate}
          </Text>
          <Text
            style={s.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  );
}
