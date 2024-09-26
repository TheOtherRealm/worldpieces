<script>
	import { fly, slide } from "svelte/transition"
	import { enhance } from "$app/forms"
	export let data
	export let form
</script>
<div class="centered">
	<h1>First Visit Info</h1>
	{#if form?.error}
		<p class="error">{form.error}</p>
	{/if}
	<form method="POST" action="?/create" use:enhance in:fly={{ y: 20 }} out:slide>
		<label>
			add a Goal:
			<input name="description" autocomplete="on" />
		</label>
	</form>
	<ul class="piece">
		{#each data.pieces as piece (piece.id)}
			<li>
				<form method="POST" action="?/delete" use:enhance in:fly={{ y: 20 }} out:slide>
					<input type="hidden" name="id" value={piece.id} />
					<span>{piece.description}</span>
					<button aria-label="Mark as complete"></button>
				</form>
			</li>
		{/each}
	</ul>
</div>
<style>
	.centered {
		max-width: 20em;
		margin: 0 auto;
	}

	label {
		width: 100%;
	}

	input {
		flex: 1;
	}

	span {
		flex: 1;
	}

	button {
		border: none;
		background: url(./remove.svg) no-repeat 50% 50%;
		background-size: 1rem 1rem;
		cursor: pointer;
		height: 100%;
		aspect-ratio: 1;
		opacity: 0.5;
		transition: opacity 0.2s;
	}

	button:hover {
		opacity: 1;
	}
	.saving {
		opacity: 0.5;
	}
</style>
