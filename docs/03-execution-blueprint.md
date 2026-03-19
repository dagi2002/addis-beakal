# Execution Blueprint

## Priority Order

### Immediate

1. Establish real server-side architecture boundaries.
2. Fix save and unsave count integrity.
3. Replace fake home metrics with real derived data.
4. Exclude removed and non-public reviews from public ratings.
5. Ship a real report submission UI.
6. Improve the business page with map and location context.
7. Keep discovery search and filters solid on mobile.

### Pre-Beta

1. Introduce real authentication and roles.
2. Move search fully server-side on the production database.
3. Make review aggregation fully transactional.
4. Replace email-based ownership assumptions with stable user relations.
5. Build atomic ownership claim workflows.
6. Add email notifications and better media handling.

### Pre-Launch

1. Add pagination to search and admin lists.
2. Add audit logging.
3. Improve open and closed logic.
4. Add analytics and monitoring.
5. Expand admin tooling and moderation ergonomics.

## MVP Must Ship

- Strong server-owned write boundaries
- Real search and filtering
- Accurate rating and review aggregates
- Business detail page with map support
- Save and unsave correctness
- Review reporting flow
- Owner and admin foundations ready for later phases

## Rebuild Principle

Do not redesign what is already working visually. Rebuild the product beneath the UI so the same experience can be trusted, extended, and launched.
