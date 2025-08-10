#!/usr/bin/env python3
"""
Generate Architecture PDF from Markdown
Creates a professional PDF document of the ByteWise Nutritionist architecture
"""

import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.platypus import KeepTogether, Preformatted
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
import datetime

# ByteWise brand colors
BRAND_YELLOW = HexColor('#faed39')
BRAND_BLUE = HexColor('#1f4aa6')
BRAND_GREEN = HexColor('#45c73e')
BRAND_DARK = HexColor('#0a0a00')

class NumberedCanvas(canvas.Canvas):
    """Add page numbers and headers to each page"""
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        """Add page number to each page."""
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        """Draw header and page number"""
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.grey)
        
        # Header
        self.drawString(inch, letter[1] - 0.5*inch, "ByteWise Nutritionist - Architecture Document")
        
        # Page number
        self.drawRightString(letter[0] - inch, 0.5*inch,
                            f"Page {self._pageNumber} of {page_count}")
        
        # Footer line
        self.setStrokeColor(BRAND_YELLOW)
        self.setLineWidth(2)
        self.line(inch, 0.75*inch, letter[0] - inch, 0.75*inch)

def create_styles():
    """Create custom styles for the PDF"""
    styles = getSampleStyleSheet()
    
    # Title style
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=BRAND_BLUE,
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    ))
    
    # Heading 1
    styles.add(ParagraphStyle(
        name='CustomH1',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=BRAND_BLUE,
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold',
        borderColor=BRAND_YELLOW,
        borderWidth=2,
        borderPadding=3,
        borderRadius=2
    ))
    
    # Heading 2
    styles.add(ParagraphStyle(
        name='CustomH2',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=BRAND_DARK,
        spaceAfter=6,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    ))
    
    # Code block style
    styles.add(ParagraphStyle(
        name='CodeBlock',
        parent=styles['Code'],
        fontSize=8,
        fontName='Courier',
        backColor=colors.lightgrey,
        borderColor=colors.darkgrey,
        borderWidth=1,
        borderPadding=6,
        borderRadius=2,
        leftIndent=20,
        rightIndent=20
    ))
    
    # Body text
    styles.add(ParagraphStyle(
        name='CustomBody',
        parent=styles['BodyText'],
        fontSize=10,
        alignment=TA_JUSTIFY,
        spaceAfter=6
    ))
    
    # Bullet points
    styles.add(ParagraphStyle(
        name='BulletPoint',
        parent=styles['BodyText'],
        fontSize=10,
        leftIndent=20,
        bulletIndent=10,
        spaceAfter=3
    ))
    
    return styles

def generate_architecture_pdf():
    """Generate the PDF document"""
    
    # Create PDF
    pdf_filename = "ByteWise_Nutritionist_Architecture.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Get styles
    styles = create_styles()
    
    # Build content
    story = []
    
    # Title page
    story.append(Spacer(1, 2*inch))
    story.append(Paragraph("ByteWise Nutritionist", styles['CustomTitle']))
    story.append(Paragraph("Complete Architecture Document", styles['CustomH2']))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("Full Stack Application Structure", styles['CustomBody']))
    story.append(Spacer(1, 1*inch))
    
    # Document info
    info_data = [
        ['Document Version:', '1.0.0'],
        ['Generated:', datetime.datetime.now().strftime('%B %d, %Y')],
        ['Production URL:', 'https://bytewisenutritionist.com'],
        ['Technology Stack:', 'React • Express.js • PostgreSQL • Supabase']
    ]
    
    info_table = Table(info_data, colWidths=[2*inch, 3*inch])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), BRAND_BLUE),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ('BACKGROUND', (0, 0), (-1, -1), colors.whitesmoke),
    ]))
    story.append(info_table)
    story.append(PageBreak())
    
    # Table of Contents
    story.append(Paragraph("Table of Contents", styles['CustomH1']))
    story.append(Spacer(1, 0.25*inch))
    
    toc_items = [
        "1. Executive Summary",
        "2. System Architecture Overview",
        "3. Frontend Structure",
        "4. Backend Structure", 
        "5. Database Schema",
        "6. Deployment Architecture",
        "7. Security Measures",
        "8. Performance Optimization",
        "9. Monitoring & Maintenance",
        "10. Disaster Recovery",
        "11. API Integration",
        "12. Mobile Support",
        "13. Development Workflow",
        "14. Future Roadmap"
    ]
    
    for item in toc_items:
        story.append(Paragraph(item, styles['BulletPoint']))
    
    story.append(PageBreak())
    
    # Executive Summary
    story.append(Paragraph("1. Executive Summary", styles['CustomH1']))
    story.append(Paragraph(
        "ByteWise Nutritionist is a comprehensive Progressive Web Application (PWA) for nutrition tracking and meal planning. "
        "The application features a React-based frontend, Express.js backend API, and Supabase for authentication and database services.",
        styles['CustomBody']
    ))
    story.append(Spacer(1, 0.25*inch))
    
    # Architecture Overview
    story.append(Paragraph("2. System Architecture Overview", styles['CustomH1']))
    story.append(Spacer(1, 0.1*inch))
    
    # Architecture diagram as table
    arch_data = [
        ['Layer', 'Technology', 'Hosting', 'Purpose'],
        ['Frontend', 'React + TypeScript', 'Vercel/Netlify', 'User Interface'],
        ['Backend', 'Express.js', 'Render/Railway', 'API Server'],
        ['Database', 'PostgreSQL', 'Supabase', 'Data Storage'],
        ['Auth', 'JWT + Supabase', 'Supabase', 'Authentication'],
        ['Storage', 'Object Storage', 'Supabase', 'File Storage']
    ]
    
    arch_table = Table(arch_data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 1.5*inch])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))
    story.append(arch_table)
    story.append(PageBreak())
    
    # Frontend Structure
    story.append(Paragraph("3. Frontend Structure", styles['CustomH1']))
    story.append(Paragraph("3.1 Key Technologies", styles['CustomH2']))
    
    frontend_tech = [
        "• React 18 with TypeScript for type-safe development",
        "• Tailwind CSS + shadcn/ui for consistent styling",
        "• TanStack Query for server state management",
        "• Wouter for lightweight routing",
        "• Vite for fast development and optimized builds",
        "• PWA with service workers for offline support"
    ]
    
    for tech in frontend_tech:
        story.append(Paragraph(tech, styles['BulletPoint']))
    
    story.append(Spacer(1, 0.25*inch))
    story.append(Paragraph("3.2 Component Architecture", styles['CustomH2']))
    
    component_data = [
        ['Component Type', 'Examples', 'Purpose'],
        ['Pages', 'ModernFoodLayout, RecipeBuilder', 'Route handlers'],
        ['UI Components', 'Button, Card, Dialog', 'Reusable UI elements'],
        ['Feature Components', 'CalorieCalculator, FastingTracker', 'Business features'],
        ['Layout Components', 'Header, Navigation, Footer', 'Page structure'],
        ['Utility Components', 'ErrorBoundary, ProtectedRoute', 'App functionality']
    ]
    
    comp_table = Table(component_data, colWidths=[1.8*inch, 2.5*inch, 2*inch])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_GREEN),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
    ]))
    story.append(comp_table)
    story.append(PageBreak())
    
    # Backend Structure
    story.append(Paragraph("4. Backend Structure", styles['CustomH1']))
    story.append(Paragraph("4.1 API Endpoints", styles['CustomH2']))
    
    api_data = [
        ['Category', 'Endpoint', 'Method', 'Purpose'],
        ['Auth', '/api/auth/signin', 'POST', 'User login'],
        ['Auth', '/api/auth/signup', 'POST', 'User registration'],
        ['Meals', '/api/meals/logged', 'GET', 'Get user meals'],
        ['Meals', '/api/meals/logged', 'POST', 'Log new meal'],
        ['Recipes', '/api/recipes', 'GET', 'Get recipes'],
        ['Recipes', '/api/recipes', 'POST', 'Create recipe'],
        ['Foods', '/api/foods/search', 'GET', 'Search foods'],
        ['Profile', '/api/profile', 'GET', 'Get user profile'],
        ['Profile', '/api/profile/goals', 'PUT', 'Update goals'],
        ['Analytics', '/api/analytics/weekly', 'GET', 'Weekly stats']
    ]
    
    api_table = Table(api_data, colWidths=[1.2*inch, 2*inch, 0.8*inch, 2*inch])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightyellow]),
    ]))
    story.append(api_table)
    story.append(PageBreak())
    
    # Database Schema
    story.append(Paragraph("5. Database Schema", styles['CustomH1']))
    story.append(Paragraph("5.1 Core Tables", styles['CustomH2']))
    
    db_data = [
        ['Table', 'Key Fields', 'Purpose'],
        ['users', 'id, email, username, goals', 'User accounts and preferences'],
        ['meals', 'id, user_id, date, calories', 'Logged meals and nutrition'],
        ['foods', 'id, name, nutrients, usda_id', 'Food database with nutrition'],
        ['recipes', 'id, user_id, ingredients', 'User-created recipes'],
        ['achievements', 'id, user_id, type, earned_at', 'User achievements and awards']
    ]
    
    db_table = Table(db_data, colWidths=[1.5*inch, 2.5*inch, 2.5*inch])
    db_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#4a5568')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
    ]))
    story.append(db_table)
    
    story.append(Spacer(1, 0.25*inch))
    story.append(Paragraph("5.2 Security Policies", styles['CustomH2']))
    story.append(Paragraph(
        "• Row Level Security (RLS) ensures users can only access their own data\n"
        "• JWT tokens validate all API requests\n"
        "• Sensitive data is encrypted at rest\n"
        "• Database backups are automated daily",
        styles['BulletPoint']
    ))
    story.append(PageBreak())
    
    # Deployment Architecture
    story.append(Paragraph("6. Deployment Architecture", styles['CustomH1']))
    
    deploy_data = [
        ['Service', 'Platform', 'Configuration', 'Status'],
        ['Frontend', 'Vercel', 'Auto-deploy from GitHub', 'Production'],
        ['Backend API', 'Render', 'Docker container, auto-scale', 'Production'],
        ['Database', 'Supabase', 'PostgreSQL, RLS enabled', 'Production'],
        ['CDN', 'Cloudflare', 'Global distribution', 'Active'],
        ['Monitoring', 'Sentry', 'Error tracking', 'Active']
    ]
    
    deploy_table = Table(deploy_data, colWidths=[1.5*inch, 1.5*inch, 2.5*inch, 1*inch])
    deploy_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightgreen),
    ]))
    story.append(deploy_table)
    
    story.append(PageBreak())
    
    # Performance & Security
    story.append(Paragraph("7. Performance & Security", styles['CustomH1']))
    
    story.append(Paragraph("Performance Optimizations:", styles['CustomH2']))
    perf_items = [
        "• Code splitting for faster initial load",
        "• Image optimization with WebP format",
        "• Service worker caching for offline support",
        "• Database query optimization with indexes",
        "• CDN distribution for global performance"
    ]
    for item in perf_items:
        story.append(Paragraph(item, styles['BulletPoint']))
    
    story.append(Spacer(1, 0.25*inch))
    story.append(Paragraph("Security Measures:", styles['CustomH2']))
    security_items = [
        "• HTTPS enforced on all connections",
        "• JWT token-based authentication",
        "• Input validation with Zod schemas",
        "• Rate limiting on API endpoints",
        "• Regular security audits and updates"
    ]
    for item in security_items:
        story.append(Paragraph(item, styles['BulletPoint']))
    
    # Footer
    story.append(PageBreak())
    story.append(Paragraph("Contact & Support", styles['CustomH1']))
    story.append(Spacer(1, 0.25*inch))
    
    contact_data = [
        ['Website', 'https://bytewisenutritionist.com'],
        ['Documentation', 'Comprehensive guides available'],
        ['Support', 'Available through the platform'],
        ['Status', 'All systems operational']
    ]
    
    contact_table = Table(contact_data, colWidths=[1.5*inch, 4*inch])
    contact_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), BRAND_BLUE),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ]))
    story.append(contact_table)
    
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph(
        f"Generated on {datetime.datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
        styles['CustomBody']
    ))
    
    # Build PDF with numbered canvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"✅ PDF generated successfully: {pdf_filename}")
    return pdf_filename

if __name__ == "__main__":
    pdf_file = generate_architecture_pdf()
    print(f"Architecture document created: {pdf_file}")
    print("You can now download this PDF document.")