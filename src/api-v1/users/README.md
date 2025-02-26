## 🔹 Hashing (One-Way Transformation)

👉 Converts data into a fixed-length string that cannot be reversed. \
Used for data integrity and verification, like passwords.

✅ One-way function (cannot be decrypted) \
✅ Always produces the same output for the same input \
✅ Fast comparisons (good for indexing & lookups) \
✅ Used for verifying, not storing, sensitive data

## 🔹 Encryption (Two-Way Transformation)

👉 Converts data into an unreadable format, but can be decrypted with a key. \
Used for data confidentiality—like encrypting emails, messages, or credit card numbers.

✅ Two-way function (can be decrypted) \
✅ Requires an encryption key \
✅ Good for sensitive data that needs to be recovered

## 🔹 Hashing vs Encryption: Key Differences

| Feature     | Hashing (One-Way)                           | Encryption (Two-Way)               |
| ----------- | ------------------------------------------- | ---------------------------------- |
| Purpose     | Data integrity, verification                | Data confidentiality               |
| Reversible? | ❌ No (irreversible)                        | ✅ Yes (with key)                  |
| Use Cases   | Passwords, digital signatures               | Emails, credit card data, messages |
| Searchable? | ✅ Yes (by hashing input and comparing)     | ❌ No (requires decryption)        |
| Security    | Cannot be reversed, but can be brute-forced | Depends on key management          |

## 🔹 When to Use Which?

✔️ Use Hashing if you don’t need to read the data later (passwords, fast lookups). \
✔️ Use Encryption if you need to retrieve the original data (sensitive user data, messages).

• To quickly search by email → Use a hash (email_hash) \
• To keep email private but still retrieve it later → Use encryption (email_encrypted)

## Database Structure Example:

| id  | email_hash | email_encrypted | iv      |
| --- | ---------- | --------------- | ------- |
| 1   | b6a8...    | a7e3...         | f1c5... |

What is iv (Initialization Vector)?

`iv` stands for **Initialization Vector**. It’s a random value used alongside encryption algorithms like AES (Advanced Encryption Standard) to ensure that **each encryption result is unique**, even if the same data is encrypted multiple times.

How to Store in PostgreSQL:
| Column Name | Purpose |
| --- | --- |
| email_hash | Stores a hash of the email for quick lookup (e.g., using SHA-256). |
| email_encrypted | Stores the AES-encrypted email. |
| iv | Stores the Initialization Vector for decryption. |

How to Search for Users Efficiently \
• Fast searches: Use email_hash (e.g., SHA-512 or SHA-512) because encryption does not allow direct searching. \
• Decrypt only when needed: After finding the user with email_hash, use iv to decrypt email_encrypted.
