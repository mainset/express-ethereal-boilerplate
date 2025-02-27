import { dbPgBoilerplateKysely } from '../src/config/database';

async function cleanupExpiredTokens() {
  try {
    console.log('Starting token cleanup...');

    // Debug: Check all tokens
    const allTokens = await dbPgBoilerplateKysely
      .selectFrom('refresh_tokens')
      .select(['id', 'expires_at', 'is_revoked', 'token_hash'])
      .execute();

    console.log('\nCurrent state:');
    console.log('Total tokens in DB:', allTokens.length);

    const expiredTokens = allTokens.filter(
      (token) => new Date(token.expires_at) < new Date(),
    );

    const revokedTokens = allTokens.filter(
      (token) => token.is_revoked === true,
    );

    console.log(`\nExpired tokens: ${expiredTokens.length}`);
    console.log(`Revoked tokens: ${revokedTokens.length}`);

    {
      /*
    if (expiredTokens.length) {
      console.table(
        expiredTokens.map((token) => ({
          id: token.id,
          expires_at: new Date(token.expires_at).toISOString(),
          expired_by: `${Math.floor(
            (Date.now() - new Date(token.expires_at).getTime()) / 1000,
          )} seconds`,
        })),
      );
    }
    */
    }

    // Delete expired OR revoked tokens
    const deletedTokens = await dbPgBoilerplateKysely
      .deleteFrom('refresh_tokens')
      .where((eb) =>
        eb.or([eb('expires_at', '<', new Date()), eb('is_revoked', '=', true)]),
      )
      .returning([
        'id',
        'token_hash',
        // optional return - used for {console.table} inside {deletedTokens.length}
        'is_revoked',
        'expires_at',
      ])
      .execute();

    console.log('\nCleanup results:');
    console.log(`Deleted tokens: ${deletedTokens.length}`);

    if (deletedTokens.length) {
      console.table(
        deletedTokens.map((t) => ({
          id: t.id,
          was_test: t.token_hash.startsWith('test_expired_token'),
        })),
      );

      const expiredCount = deletedTokens.filter(
        (t) => new Date(t.expires_at) < new Date(),
      ).length;
      const revokedCount = deletedTokens.filter(
        (t) => t.is_revoked === true,
      ).length;

      console.log(`  - Expired: ${expiredCount}`);
      console.log(`  - Revoked: ${revokedCount}`);
    }

    const remainingTokens = await dbPgBoilerplateKysely
      .selectFrom('refresh_tokens')
      .select(['id', 'expires_at', 'is_revoked', 'token_hash'])
      .execute();

    console.log('\nRemaining active tokens:', remainingTokens.length);

    process.exit(0);
  } catch (error: Error | unknown) {
    if (error instanceof Error) {
      console.error({
        action: '[cleanup-expired-tokens] cleanupExpiredTokens error',
        message: error.message,
        stack: error.stack,
      });
    } else {
      console.error('[cleanup-expired-tokens] Unexpected error', error);
    }
    process.exit(1);
  }
}

cleanupExpiredTokens();
