namespace Bergdahl.LinkDash.Web;

/// <summary>
/// The app's name and repository, shown in the top bar, the login screen and the footer.
/// </summary>
public static class AppInfo
{
    public const string Name = "LinkDash";

    public const string RepositoryUrl = "https://github.com/jonnybergdahl/DotNet_LinkDash_Web";

    /// <summary>
    /// Values for ViewData["Page"]: the left menu entry a view belongs to, highlighted while it is shown.
    /// </summary>
    public static class Pages
    {
        public const string Dashboard = "dashboard";
        public const string Groups = "groups";
        public const string Links = "links";
        public const string Account = "account";
    }
}
