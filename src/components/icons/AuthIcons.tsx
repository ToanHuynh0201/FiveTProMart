export const PersonIcon = () => (
	<svg
		width="44"
		height="44"
		viewBox="0 0 44 44"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		style={{
			width: "100%",
			height: "100%",
			maxWidth: "44px",
			maxHeight: "44px",
		}}>
		<path
			d="M22 22C26.4183 22 30 18.4183 30 14C30 9.58172 26.4183 6 22 6C17.5817 6 14 9.58172 14 14C14 18.4183 17.5817 22 22 22ZM22 26C16.4772 26 6 28.7614 6 34.25V38H38V34.25C38 28.7614 27.5228 26 22 26Z"
			fill="#000000"
		/>
	</svg>
);

export const LockIcon = () => (
	<svg
		width="30"
		height="32"
		viewBox="0 0 30 32"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		style={{
			width: "100%",
			height: "100%",
			maxWidth: "30px",
			maxHeight: "32px",
		}}>
		<path
			d="M25 14H23V10C23 5.58172 19.4183 2 15 2C10.5817 2 7 5.58172 7 10V14H5C3.34315 14 2 15.3431 2 17V27C2 28.6569 3.34315 30 5 30H25C26.6569 30 28 28.6569 28 27V17C28 15.3431 26.6569 14 25 14ZM15 23C13.3431 23 12 21.6569 12 20C12 18.3431 13.3431 17 15 17C16.6569 17 18 18.3431 18 20C18 21.6569 16.6569 23 15 23ZM19.5 14H10.5V10C10.5 7.51472 12.5147 5.5 15 5.5C17.4853 5.5 19.5 7.51472 19.5 10V14Z"
			fill="#000000"
		/>
	</svg>
);

export const PasswordDotsIcon = () => (
	<svg
		width="145"
		height="9"
		viewBox="0 0 145 9"
		fill="none"
		xmlns="http://www.w3.org/2000/svg">
		{Array.from({ length: 9 }).map((_, i) => (
			<circle
				key={i}
				cx={i * 17 + 4.5}
				cy="4.5"
				r="4.5"
				fill="black"
			/>
		))}
	</svg>
);
