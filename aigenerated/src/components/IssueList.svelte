<script>
    import { onMount } from 'svelte';
    import axios from '$lib/api/github';
    let issues = [];
    let repo = 'your-github-username/your-repository-name';
  
    onMount(async () => {
      const fetchedIssues = await axios.getIssues(repo);
      issues = fetchedIssues;
    });
  </script>
  
  <div class="issue-list">
    <h2>{$issues.length} open issues available</h2>
    {#each issue in issues as |issue|}
      <a href={issue.html_url}>{issue.title}</a>
    {/each}
  </div>