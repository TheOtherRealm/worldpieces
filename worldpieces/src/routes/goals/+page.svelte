<script>
    export let data;
</script>

<h1>
    Goals
</h1>

<ul>
    <!-- <li><a href='/goals/goal1'>Goal 1</a></li>
    <li><a href='/goals/goal2'>Goal 2</a></li>
    <li><a href='/goals/goal3'>Goal 3</a></li>
    <li><a href='/goals/goal4'>Goal 4</a></li> -->
    {#each data.summaries as {slug,title}}
    <li><a href='/goals/{slug}'>{title}</a></li>
    {/each}
</ul>