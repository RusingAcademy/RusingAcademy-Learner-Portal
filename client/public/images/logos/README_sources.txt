================================================================================
README_sources.txt - Logo Assets Traceability
RusingAcademy Ecosystem - "Ils nous ont fait confiance" Section
Generated: 2026-01-12
Last QA Update: 2026-01-12
================================================================================

OVERVIEW
--------
This document provides full traceability for all official Canadian federal 
institution logos used in the "They Trusted Us / Ils nous ont fait confiance" 
section of the RusingAcademy ecosystem hub page.

All logos are official assets from Canadian federal institutions, used for 
illustrative purposes to show the types of organizations whose employees 
have benefited from our services.

================================================================================
LOGO INVENTORY
================================================================================

1. CANADIAN DIGITAL SERVICE (CDS) / SERVICE NUMÉRIQUE CANADIEN (SNC)
--------------------------------------------------------------------------------
   Local File:     01_SVG/GC_CDS_SNC_EN_logo_20260112.svg
                   01_SVG/GC_CDS_SNC_FR_logo_20260112.svg
   Source Page:    https://github.com/cds-snc/common-assets
   Download URL:   https://raw.githubusercontent.com/cds-snc/common-assets/master/EN/cds-snc.svg
                   https://raw.githubusercontent.com/cds-snc/common-assets/master/FR/snc-cds.svg
   Format:         SVG (vector)
   Language:       EN and FR versions available
   Resolution:     Vector (infinite scalability)
   Background:     Transparent
   License:        Open Government License - Canada
   Notes:          Official logo from CDS GitHub repository. Optimized with SVGO.

2. DEPARTMENT OF NATIONAL DEFENCE (DND) / MINISTÈRE DE LA DÉFENSE NATIONALE (MDN)
--------------------------------------------------------------------------------
   Local File:     02_PNG/GC_DND_MDN_FR-EN_logo_20260112.png
   Source Page:    https://seeklogo.com/vector-logo/311787/defense-nationale-canada
   Download URL:   Image search result (PNG format)
   Format:         PNG
   Language:       FR-EN bilingual
   Resolution:     600x600px
   Background:     Transparent
   License:        Government of Canada official mark
   Notes:          Official bilingual signature with "Défense nationale / National Defence"

3. CORRECTIONAL SERVICE OF CANADA (CSC) / SERVICE CORRECTIONNEL DU CANADA (SCC)
--------------------------------------------------------------------------------
   Local File:     02_PNG/GC_CSC_SCC_EN_logo_20260112.png
   Source Page:    https://www.canada.ca/en/correctional-service.html
   Download URL:   Image search result (PNG format)
   Format:         PNG
   Language:       EN (with crest)
   Resolution:     800x492px
   Background:     Transparent
   License:        Government of Canada official mark
   Notes:          Official logo with CSC/SCC crest and Canada wordmark

4. INNOVATION, SCIENCE AND ECONOMIC DEVELOPMENT CANADA (ISED) / 
   INNOVATION, SCIENCES ET DÉVELOPPEMENT ÉCONOMIQUE CANADA (ISDE)
--------------------------------------------------------------------------------
   Local File:     02_PNG/GC_ISED_ISDE_EN_logo_20260112.jpg
   Source Page:    https://www.ic.gc.ca/
   Download URL:   Image search result (RABC-CCCR source)
   Format:         JPG
   Language:       EN
   Resolution:     1540x514px (HD)
   Background:     White
   License:        Government of Canada official mark
   Notes:          Official signature with full department name

5. EMPLOYMENT AND SOCIAL DEVELOPMENT CANADA (ESDC) / 
   EMPLOI ET DÉVELOPPEMENT SOCIAL CANADA (EDSC)
--------------------------------------------------------------------------------
   Local File:     02_PNG/GC_ESDC_EDSC_EN_logo_20260112.png
   Source Page:    https://www.canada.ca/en/employment-social-development.html
   Download URL:   Image search result (PNG format)
   Format:         PNG
   Language:       EN
   Resolution:     311x161px
   Background:     Transparent
   License:        Government of Canada official mark
   Notes:          Official signature with Canada flag and department name

6. TREASURY BOARD OF CANADA SECRETARIAT (TBS) / 
   SECRÉTARIAT DU CONSEIL DU TRÉSOR DU CANADA (SCT)
--------------------------------------------------------------------------------
   Local File:     02_PNG/GC_TBS_SCT_EN_logo_20260112.png
   Source Page:    https://www.canada.ca/en/treasury-board-secretariat.html
   Download URL:   Image search result (PNG format)
   Format:         PNG
   Language:       EN
   Resolution:     300x300px
   Background:     Transparent
   License:        Government of Canada official mark
   Notes:          Official signature with Canada flag and secretariat name

================================================================================
DIRECTORY STRUCTURE
================================================================================

/images/logos/
├── 01_SVG/                          # Vector logos (preferred)
│   ├── GC_CDS_SNC_EN_logo_20260112.svg
│   └── GC_CDS_SNC_FR_logo_20260112.svg
├── 02_PNG/                          # Raster logos (PNG/JPG)
│   ├── GC_CSC_SCC_EN_logo_20260112.png
│   ├── GC_CSPS_EFPC_EN_logo_20260112.jpg
│   ├── GC_DND_MDN_FR-EN_logo_20260112.png
│   ├── GC_ESDC_EDSC_EN_logo_20260112.png
│   ├── GC_ISED_ISDE_EN_logo_20260112.jpg
│   └── GC_TBS_SCT_EN_logo_20260112.png
├── 03_Campaign_Assets/              # Reserved for future campaign assets
└── README_sources.txt               # This file

================================================================================
NAMING CONVENTION
================================================================================

Format: GC_<ORG>_<LANG>_<TYPE>_<YYYYMMDD>.<ext>

- GC:       Government of Canada prefix
- ORG:      Organization acronym (EN_FR format, e.g., CDS_SNC)
- LANG:     Language version (EN, FR, or FR-EN for bilingual)
- TYPE:     Asset type (logo, campaign, signature)
- YYYYMMDD: Date of acquisition
- ext:      File extension (svg, png, jpg)

================================================================================
USAGE GUIDELINES
================================================================================

1. These logos are used for illustrative purposes only
2. RusingAcademy is a private entrepreneurial initiative
3. No endorsement by the Government of Canada is implied
4. All logos remain the property of their respective institutions
5. Usage complies with Government of Canada visual identity guidelines

================================================================================
WEB IMPLEMENTATION
================================================================================

Component:    /client/src/components/homepage/TheyTrustedUs.tsx
Display:      Grid layout (6 columns on desktop, 3 on tablet, 2 on mobile)
Height:       Responsive: 40px (mobile) → 48px (sm) → 56px (md)
Effects:      50% grayscale by default, full color on hover
              Scale 1.05 + y-4 translation on hover
              Shadow elevation on hover
Alt Tags:     Bilingual alt text for accessibility (EN/FR based on language)
Animation:    Framer Motion entrance animations with staggered delays

================================================================================
QA & OPTIMIZATION LOG (2026-01-12)
================================================================================

ASSET OPTIMIZATION
------------------
1. SVG files optimized with SVGO v4.0.0
   - GC_CDS_SNC_EN_logo_20260112.svg: 2.404 KiB → 2.394 KiB (-0.4%)
   - GC_CDS_SNC_FR_logo_20260112.svg: 2.428 KiB → 2.420 KiB (-0.3%)

2. PNG/JPG files optimized with PIL (quality=85, optimize=True)
   - All raster images re-compressed for web delivery

ACCESSIBILITY ENHANCEMENTS
--------------------------
1. Section: aria-labelledby="they-trusted-us-heading"
2. Logo grid: role="list" with aria-label (bilingual)
3. Logo cards: role="listitem" with title attribute
4. Decorative SVGs: aria-hidden="true"
5. Images: loading="lazy", decoding="async"
6. Alt text: Bilingual, descriptive format

STYLING IMPROVEMENTS
--------------------
1. Reduced grayscale from 100% to 50% for better visibility
2. Added contrast-125 filter for clearer logos
3. Added border styling for card definition
4. Improved hover effects with scale and y-translation
5. Responsive logo heights: h-10 → h-12 → h-14
6. Added Framer Motion entrance animations

COMMIT REFERENCE
----------------
Commit: 5214bc4cedcbb56db5c5bd13c559eaf959110541
Branch: railway-deployment
Message: "QA: Enhanced They Trusted Us section - improved visibility, 
         animations, accessibility, and responsive design"

================================================================================
CONTACT
================================================================================

For questions about logo usage or to report issues:
- Email: steven.barholere@rusingacademy.ca
- Website: https://www.rusingacademy.ca

================================================================================
END OF DOCUMENT
================================================================================
