namespace Bergdahl.LinkDash.Web.Models;

/// <summary>
/// One row in the top bar's search results.
/// </summary>
/// <param name="Title">The page, group or link name.</param>
/// <param name="Subtitle">What it is, or the group a link belongs to.</param>
/// <param name="Icon">A Material Symbols icon name.</param>
/// <param name="Url">Where choosing the result goes.</param>
/// <param name="External">True for links, which open the linked site in a new tab.</param>
public record SearchResult(string Title, string Subtitle, string Icon, string Url, bool External = false);
