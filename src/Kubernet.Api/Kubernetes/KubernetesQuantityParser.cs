using System.Globalization;

namespace Kubernet.Api.Kubernetes;

public static class KubernetesQuantityParser
{
    private static readonly IReadOnlyDictionary<string, decimal> DecimalSuffixes = new Dictionary<string, decimal>(StringComparer.Ordinal)
    {
        ["n"] = 0.000000001m,
        ["u"] = 0.000001m,
        ["m"] = 0.001m,
        [""] = 1m,
        ["k"] = 1_000m,
        ["M"] = 1_000_000m,
        ["G"] = 1_000_000_000m,
        ["T"] = 1_000_000_000_000m,
        ["P"] = 1_000_000_000_000_000m,
        ["E"] = 1_000_000_000_000_000_000m,
    };

    private static readonly IReadOnlyDictionary<string, decimal> BinarySuffixes = new Dictionary<string, decimal>(StringComparer.Ordinal)
    {
        ["Ki"] = 1_024m,
        ["Mi"] = 1_048_576m,
        ["Gi"] = 1_073_741_824m,
        ["Ti"] = 1_099_511_627_776m,
        ["Pi"] = 1_125_899_906_842_624m,
        ["Ei"] = 1_152_921_504_606_846_976m,
    };

    public static double ParseCpuCores(string? quantity)
    {
        if (string.IsNullOrWhiteSpace(quantity))
        {
            return 0d;
        }

        var parsed = ParseQuantity(quantity);
        return (double)parsed;
    }

    public static long ParseMemoryBytes(string? quantity)
    {
        if (string.IsNullOrWhiteSpace(quantity))
        {
            return 0L;
        }

        var parsed = ParseQuantity(quantity);
        return parsed <= 0 ? 0L : decimal.ToInt64(decimal.Round(parsed, MidpointRounding.AwayFromZero));
    }

    private static decimal ParseQuantity(string quantity)
    {
        var trimmed = quantity.Trim();
        var numberLength = 0;

        while (numberLength < trimmed.Length && IsQuantityNumberCharacter(trimmed[numberLength]))
        {
            numberLength++;
        }

        var numericPart = trimmed[..numberLength];
        var suffix = trimmed[numberLength..];

        if (!decimal.TryParse(numericPart, NumberStyles.Float, CultureInfo.InvariantCulture, out var value))
        {
            throw new FormatException($"Could not parse Kubernetes quantity '{quantity}'.");
        }

        if (BinarySuffixes.TryGetValue(suffix, out var binaryMultiplier))
        {
            return value * binaryMultiplier;
        }

        if (DecimalSuffixes.TryGetValue(suffix, out var decimalMultiplier))
        {
            return value * decimalMultiplier;
        }

        throw new FormatException($"Unsupported Kubernetes quantity suffix '{suffix}' in '{quantity}'.");
    }

    private static bool IsQuantityNumberCharacter(char character)
    {
        return char.IsDigit(character) || character is '.' or '-' or '+';
    }
}
