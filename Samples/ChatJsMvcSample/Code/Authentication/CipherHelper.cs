using System;
using System.Security.Cryptography;
using System.Text;

namespace ChatJsMvcSample.Code.Authentication
{
    public class CipherHelper
    {
        private const char COMPRESSED = 'C';
        private const char NOTCOMPRESSED = 'P';
        private const int MINIMUM_LENGTH_FOR_COMPRESSION = 512;
        private const string HASH_ALGORITHM = "SHA1";
        private const int PASSWORD_ITERATIONS = 2;
        private const int KEY_SIZE = 256;


        public static string EncryptToBase64(string plaintext)
        {
            var plainBytes = CompressionHelper.StringToBytes(plaintext);
            var cipherBytes = Encrypt(plainBytes);
            return Convert.ToBase64String(cipherBytes);
        }

        public static string GenerateSalt()
        {
            var bytes = new byte[0x10];
            new RNGCryptoServiceProvider().GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }

        public static byte[] Hash(byte[] value, byte[] salt)
        {
            var bytes = new byte[value.Length + salt.Length];
            Buffer.BlockCopy(salt, 0, bytes, 0, salt.Length);
            Buffer.BlockCopy(value, 0, bytes, salt.Length, value.Length);
            return (new SHA1CryptoServiceProvider()).ComputeHash(bytes);
        }

        public static string Hash(string value, string salt)
        {
            var valueBytes = Encoding.Unicode.GetBytes(value);
            var saltBytes = Convert.FromBase64String(salt);
            return Convert.ToBase64String(Hash(valueBytes, saltBytes));
        }

        public static string Encrypt(string plaintext)
        {
            return Encrypt(plaintext, true);
        }

        public static byte[] Encrypt(byte[] plainbytes)
        {
            return Encrypt(plainbytes, true);
        }

        public static string Encrypt(string plaintext, bool compress)
        {
            return CompressionHelper.BytesToString(Encrypt(CompressionHelper.StringToBytes(plaintext), compress));
        }

        public static byte[] Encrypt(byte[] plainbytes, bool compress)
        {

            byte[] buffer;
            byte compressFlag;
            if (plainbytes.Length > MINIMUM_LENGTH_FOR_COMPRESSION)
            {
                compressFlag = Convert.ToByte(COMPRESSED);
                buffer = CompressionHelper.Deflate(plainbytes);
            }
            else
            {
                compressFlag = Convert.ToByte(NOTCOMPRESSED);
                buffer = plainbytes;
            }

            byte[] encryptedBytes = Obviex.CipherLite.Rijndael.Encrypt(CompressionHelper.BytesToString(buffer),
                                                                       "this is a pass phrase", null, KEY_SIZE,
                                                                       PASSWORD_ITERATIONS, "this is a salt value",
                                                                       HASH_ALGORITHM);

            //SettingHelper.GetSetting("Security.Cipher.PassPhrase"), SettingHelper.GetSetting("Security.Cipher.InitVector"), KEY_SIZE, PASSWORD_ITERATIONS, SettingHelper.GetSetting("Security.Cipher.Salt"), HASH_ALGORITHM);
            var toReturn = new byte[encryptedBytes.Length + 1];

            var index = 0;
            toReturn[index++] = compressFlag;
            foreach (var b in encryptedBytes)
            {
                toReturn[index++] = b;
            }

            return toReturn;
        }

        public static string DecryptFromBase64(string ciphertext)
        {
            var cipherBytes = Convert.FromBase64String(ciphertext);
            return Decrypt(cipherBytes);
        }

        public static string Decrypt(string ciphertext)
        {
            return Decrypt(ciphertext, true);
        }

        public static string Decrypt(byte[] cipherbytes)
        {
            return Decrypt(cipherbytes, true);
        }

        public static string Decrypt(string ciphertext, bool compress)
        {
            return Decrypt(CompressionHelper.StringToBytes(ciphertext), compress);
        }

        public static string Decrypt(byte[] cipherbytes, bool compress)
        {

            var buffer = new byte[cipherbytes.Length - 1];
            var index = 0;
            for (var i = 1; i < cipherbytes.Length; i++)
            {
                buffer[index++] = cipherbytes[i];
            }

            var decrypted = Obviex.CipherLite.Rijndael.Decrypt(buffer, "this is a pass phrase", null, KEY_SIZE,
                                                               PASSWORD_ITERATIONS, "this is a salt value",
                                                               HASH_ALGORITHM);
            return cipherbytes[0] == COMPRESSED ? CompressionHelper.Inflate(decrypted) : decrypted;
        }
    }
}