using System.Diagnostics;
using Bergdahl.LinkDash.Core.Services;
using Bergdahl.LinkDash.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace Bergdahl.LinkDash.Web.Controllers;

public class HomeController(ILinkService linkService) : Controller
{
    private const int MaxSearchResults = 8;

    public async Task<IActionResult> Index(CancellationToken cancellationToken)
    {
        var groups = await linkService.GetGroupsAsync(cancellationToken);
        return View(groups);
    }

    /// <summary>
    /// Backs the search field in the top bar: pages whose title matches, then groups by name, then links by
    /// title, description or URL. Pages and groups open in the app; links open the linked site.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Search(string? q, CancellationToken cancellationToken)
    {
        var query = q?.Trim();
        if (string.IsNullOrEmpty(query))
        {
            return Json(Array.Empty<SearchResult>());
        }

        bool Matches(string? text) => text?.Contains(query, StringComparison.OrdinalIgnoreCase) == true;

        SearchResult[] pages =
        [
            new("Dashboard", "Page", "dashboard", Url.Action(nameof(Index))!),
            new("Groups", "Settings", "folder", Url.Action("Index", "Settings")!),
            new("Links", "Settings", "link", Url.Action("Links", "Settings")!)
        ];

        var groups = await linkService.GetGroupsAsync(cancellationToken);
        var groupResults = groups
            .Where(g => Matches(g.Name))
            .Select(g => new SearchResult(g.Name, "Group", "folder", $"{Url.Action(nameof(Index))}#group-{g.Id}"));
        var linkResults = groups
            .SelectMany(g => g.Links.Select(l => (Group: g, Link: l)))
            .Where(x => Matches(x.Link.Title) || Matches(x.Link.Description) || Matches(x.Link.Url))
            .Select(x => new SearchResult(x.Link.Title, x.Group.Name, "open_in_new", x.Link.Url, External: true));

        return Json(pages.Where(p => Matches(p.Title)).Concat(groupResults).Concat(linkResults).Take(MaxSearchResults));
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
