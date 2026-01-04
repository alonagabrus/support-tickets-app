namespace Backend.Configuration;

public class StorageSettings
{
    public const string SectionName = "Storage";
    public string FilePath { get; set; } = "data/tickets.json";
}
