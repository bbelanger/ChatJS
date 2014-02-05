using System.IO;
using System.IO.Compression;
using System.Text;

namespace ChatJsMvcSample.Code.Authentication
{
    public class CompressionHelper
    {
        public static string Inflate(string encoded)
        {
            return BytesToString(Inflate(StringToBytes(encoded)));
        }

        public static byte[] Inflate(byte[] encoded)
        {
            using (var inputStream = new MemoryStream(encoded))
            {
                using (var inflateStream = new DeflateStream(inputStream, CompressionMode.Decompress))
                {
                    string inflatedString;
                    using (var sr = new StreamReader(inflateStream, Encoding.Default))
                    {
                        inflatedString = sr.ReadToEnd();
                    }
                    return StringToBytes(inflatedString);
                }
            }
        }

        public static string Deflate(string value)
        {
            return BytesToString(Deflate(StringToBytes(value)));
        }

        public static byte[] Deflate(byte[] bytes)
        {
            using (var outputStream = new MemoryStream())
            {
                using (var deflateStream = new DeflateStream(outputStream, CompressionMode.Decompress))
                {
                    using (var inputStream = new MemoryStream(bytes))
                    {
                        inputStream.WriteTo(deflateStream);
                    }

                    outputStream.Seek(0, SeekOrigin.Begin);

                    return outputStream.GetBuffer();
                }
            }
        }

        public static byte[] StringToBytes(string value)
        {
            return Encoding.Default.GetBytes(value);
        }

        public static string BytesToString(byte[] bytes)
        {
            return Encoding.Default.GetString(bytes);
        }

    }
}
