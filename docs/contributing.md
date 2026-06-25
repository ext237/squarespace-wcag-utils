# Contributing

Thank you for your interest in contributing to SqsA11y.

Contributions of all sizes are welcome, including:

* bug fixes
* documentation improvements
* remediation enhancements
* audit enhancements
* performance improvements
* WCAG research
* test case websites and documentation
* examples and tutorials

## Before You Begin

Please review the project documentation:

* `README.md`
* `docs/installation.md`
* `docs/configuration.md`
* `docs/creating-audit-enhancements.md`
* `docs/creating-remediation-enhancements.md`
* `docs/limitations.md`

Understanding the project's goals, coding style, and enhancement structure will make the review process much smoother.

## Fork the Repository

Start by creating a fork of the project on GitHub.

```bash
git clone https://github.com/YOUR-USERNAME/squarespace-wcag-utils.git
cd squarespace-wcag-utils
```

Replace `YOUR-USERNAME` with your GitHub username.

## Create a Feature Branch

Create a branch for your work.

```bash
git checkout -b feature/my-enhancement
```

Examples:

```text
feature/heading-audit-improvements
feature/focus-outline-fix
feature/new-enhancement
docs/readme-update
```

Please avoid working directly on the `main` branch.

## Add or Edit Enhancement Files

Depending on your contribution, you may be:

* creating a new enhancement
* updating an existing enhancement
* fixing a bug
* improving documentation

New enhancements should follow the guidance in:

```text
docs/creating-audit-enhancements.md
docs/creating-remediation-enhancements.md
```

If your enhancement injects CSS, also review:

```text
docs/adding-removing-css.md
```

### Documentation Requirements

Enhancement submissions should include:

* Related WCAG Criteria
* Description
* Squarespace Context
* Dependencies
* Notes

Example:

```js
/**
 * Related WCAG Criteria:
 *   - 2.4.7 Focus Visible
 *
 * Description:
 *   Improves keyboard focus visibility.
 */
```

> [!IMPORTANT]
> Contributions to this project help the broader accessibility community. Please consider contributing custom enhancement files back to the project.
>
> The `Related WCAG Criteria` and `Description` sections are especially important for documentation, review, and possible inclusion in future SqsA11y documentation resources.

## Update Documentation If Needed

If your change affects:

* installation
* configuration
* enhancement behavior
* WCAG support
* developer workflows

please update the relevant documentation.

Documentation updates are often reviewed just as carefully as code changes.

## Test Locally

Before submitting your contribution:

* test the enhancement
* test multiple page types if applicable
* test Squarespace 7.0 and 7.1 when possible
* test with logging enabled
* verify there are no console errors

Where practical, perform:

* keyboard testing
* screen reader testing
* mobile testing

## Commit Changes

Stage and commit your changes.

```bash
git add -A
git commit -m "Add focus management enhancement"
```

Use clear commit messages that describe the change.

Good examples:

```text
Add duplicate form error cleanup enhancement
Fix focus outline issue on mobile navigation
Update README installation instructions
Improve heading audit reporting
```

## Push the Branch

Push your feature branch to your fork.

```bash
git push -u origin feature/my-enhancement
```

## Open a Pull Request

Open a Pull Request against the main SqsA11y repository.

Please include:

* a summary of the change
* the problem being solved
* related WCAG criteria
* testing performed
* screenshots or examples if applicable

Helpful pull requests make the review process much faster.

## Enhancement Review Guidelines

Contributors should strive to create enhancements that are:

* not otherwise available in the Squarespace builder or settings screens
* focused on a single concern
* conservative in their modifications
* safe to run multiple times
* well documented
* WCAG-focused
* compatible with Squarespace 7.0 and 7.1 where practical

Enhancements should avoid:

* unnecessary DOM changes
* unnecessary ARIA changes
* excessive console logging
* assumptions about page content
* assumptions about business intent

## Reporting Bugs

Bug reports are welcome.

Please include:

* the enhancement name
* example website URL
* Squarespace version (7.0 or 7.1)
* browser
* operating system
* reproduction steps
* screenshots if available
* console errors if present

## Questions and Discussions

Questions, ideas, and enhancement proposals are welcome.

If you are unsure whether a feature belongs in the project, open a discussion or issue before spending significant time on development.

## Thank You

SqsA11y exists because accessibility professionals, developers, testers, and site owners are willing to share their knowledge and improvements with the community.

Thank you for helping make Squarespace websites more accessible.
