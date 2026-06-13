# Defer provider-specific auth

The first prototype may use ephemeral sessions without authentication, while v1 should authenticate hosts and continue to let participants join with an invite link plus visible display name. This preserves the low-friction participant loop while acknowledging that hosted persistence and deletion controls require host identity before the product is treated as production-ready.
