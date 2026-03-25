using System.Reflection;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Extractors;
using Models;

namespace Tests.Extractors
{
    [TestClass]
    public class SpotifyPlaylistItemParserTests
    {
        [TestMethod]
        public void TryParseTrack_WithLegacyTrackPayload_ParsesTrack()
        {
            var result = InvokeParser(new LegacyPlaylistItem
            {
                Track = new TestPlayableItem
                {
                    Artists = new[] { new TestArtist { Name = "Legacy Artist" } },
                    Album = new TestAlbum { Name = "Legacy Album" },
                    Name = "Legacy Title",
                    DurationMs = 183000,
                    Uri = "spotify:track:legacy"
                }
            }, 7);

            Assert.IsNotNull(result);
            Assert.AreEqual("Legacy Artist", result.Artist);
            Assert.AreEqual("Legacy Album", result.Album);
            Assert.AreEqual("Legacy Title", result.Title);
            Assert.AreEqual(183, result.Length);
            Assert.AreEqual("spotify:track:legacy", result.URI);
            Assert.AreEqual(7, result.ItemNumber);
        }

        [TestMethod]
        public void TryParseTrack_WithMigratedItemPayload_ParsesTrack()
        {
            var result = InvokeParser(new MigratedPlaylistItem
            {
                Item = new TestPlayableItem
                {
                    Artists = new[] { new TestArtist { Name = "Migrated Artist" } },
                    Album = new TestAlbum { Name = "Migrated Album" },
                    Name = "Migrated Title",
                    DurationMs = 205000,
                    Uri = "spotify:track:migrated"
                }
            }, 3);

            Assert.IsNotNull(result);
            Assert.AreEqual("Migrated Artist", result.Artist);
            Assert.AreEqual("Migrated Album", result.Album);
            Assert.AreEqual("Migrated Title", result.Title);
            Assert.AreEqual(205, result.Length);
            Assert.AreEqual("spotify:track:migrated", result.URI);
            Assert.AreEqual(3, result.ItemNumber);
        }

        [TestMethod]
        public void TryParseTrack_WithoutItemOrTrack_ReturnsNull()
        {
            var result = InvokeParser(new EmptyPlaylistItem(), 1);
            Assert.IsNull(result);
        }

        private static Track? InvokeParser(object playlistItem, int itemNumber)
        {
            var parserType = typeof(SpotifyExtractor).Assembly.GetType("Extractors.SpotifyPlaylistItemParser", throwOnError: true)!;
            var method = parserType.GetMethod("TryParseTrack", BindingFlags.Public | BindingFlags.Static)!;
            return method.Invoke(null, new object[] { playlistItem, itemNumber }) as Track;
        }

        private sealed class LegacyPlaylistItem
        {
            public TestPlayableItem? Track { get; set; }
        }

        private sealed class MigratedPlaylistItem
        {
            public TestPlayableItem? Item { get; set; }
        }

        private sealed class EmptyPlaylistItem
        {
            public string? SnapshotId { get; set; }
        }

        private sealed class TestPlayableItem
        {
            public TestArtist[]? Artists { get; set; }
            public TestAlbum? Album { get; set; }
            public string? Name { get; set; }
            public int DurationMs { get; set; }
            public string? Uri { get; set; }
        }

        private sealed class TestArtist
        {
            public string? Name { get; set; }
        }

        private sealed class TestAlbum
        {
            public string? Name { get; set; }
        }
    }
}