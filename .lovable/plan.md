# Finish www connection + get the site showing on Google

## What I found
- www.buildwithhermedia.com was added to the project 5 days ago, but the DNS records were never created at Namecheap. It currently shows a Namecheap parking page.
- The main domain buildwithhermedia.com is live and verified in Google Search Console, with the sitemap (51 pages) already submitted.

## Step 1: Fix the www DNS records
I will show a connection card in chat with the exact records. You add them in Namecheap (where you manage DNS):

- A record: name `www` → value `185.158.133.1`
- TXT record: name `_lovable.www` → value `lovable_verify=3c908d67113d4465445c0520b7c845801e6ae5d84e23fd87a707fed622d1aeba`
- Remove the existing parking CNAME on www if Namecheap shows one.

After you add them, I re-check DNS, wait for verification and the SSL certificate, and confirm www loads and redirects to buildwithhermedia.com.

## Step 2: Speed up Google (optional but recommended)
Your site is already technically set up correctly (verified property, sitemap submitted, unique titles and descriptions, one main heading per page, self-referencing canonicals, real text in the page source, photo descriptions, robots.txt). What's left is mostly patience plus two things you can do in Search Console:

1. In Search Console, use URL Inspection on `https://buildwithhermedia.com/` and click "Request indexing" for the homepage. Repeat later for key pages (services, podcast, score).
2. Watch the "Pages" report in Search Console over the next 1-2 weeks to see pages being indexed.

## Step 3: What makes it actually rank (ongoing, not one-time)
- Google needs a few days to a few weeks to crawl and index after the sitemap submission. Rankings follow indexing, not the other way around.
- Post regularly on /learn and /blog (fresh content gets crawled more often).
- Links from other sites to yours (podcast guest links, partner sites, social profiles) are the biggest ranking factor you control.
- Keep the site published and the domain connected; removing it or letting DNS lapse resets progress.

No design or page-content changes are needed for any of this.
