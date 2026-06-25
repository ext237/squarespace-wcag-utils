/**
 * Proposed Enhancement: sameDestinationLinkPurposeEnhancer
 * ----------------------------------------------------------------
 *
 * Purpose:
 *   This enhancement would attempt to improve link purpose for links that
 *   point to the same destination but use different visible link text.
 *
 *   This is common on marketing websites, where repeated links may point to
 *   the same URL while using natural, context-specific phrases such as:
 *
 *     <a href="/catering">Catering</a>
 *     <a href="/catering">Contact us about Catering</a>
 *
 *   Rather than forcing all links with the same destination to use the same
 *   aria-label, this enhancement would add a shared aria-describedby reference
 *   to provide additional programmatic destination context.
 *
 *   This approach preserves each link's visible text as its accessible name,
 *   reducing the risk of creating a visible-label / accessible-name mismatch
 *   under WCAG 2.5.3 Label in Name.
 *
 * Proposed behavior:
 *   Before:
 *
 *     <a href="/catering">Catering</a>
 *     <a href="/catering">Contact us about Catering</a>
 *
 *   After:
 *
 *     <span id="sqs-a11y-catering-link-desc" class="sr-only">
 *       Links to the catering page.
 *     </span>
 *
 *     <a href="/catering" aria-describedby="sqs-a11y-catering-link-desc">Catering</a>
 *     <a href="/catering" aria-describedby="sqs-a11y-catering-link-desc">Contact us about Catering</a>
 *
 * Notes:
 *   - It may not satisfy automated tools that compare only accessible names.
 *   - Existing descriptive link text should not be overwritten.
 *   - Existing aria-label values should not be changed unless they are clearly broken.
 *
 * Rejected approach:
 *   Updating aria-label on all same-destination links was rejected because
 *   aria-label overrides the visible link text in the accessible name. If the
 *   visible text is not included in the aria-label, this can create a WCAG
 *   2.5.3 Label in Name issue.
 *
 * Related:
 *   The existing linkPurposeEnhancer improves vague link text such as
 *   "Read More" or "Learn More" in Squarespace Summary blocks. A shared helper
 *   may eventually be useful so ambiguous link text detection can be reused by
 *   multiple enhancements.
 *
 * Research needed:
 *   Additional testing is needed with NVDA, JAWS, VoiceOver, browser accessibility
 *   trees, and common WCAG scanners to determine whether this should be shipped
 *   as an automated enhancement, an audit-only helper, or a developer opt-in.
 */